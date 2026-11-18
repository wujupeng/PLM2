package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsWarehouseQuery;
import com.huaweicloud.plm.system.dto.WmsWarehouseSaveRequest;
import com.huaweicloud.plm.system.entity.WmsWarehouse;
import com.huaweicloud.plm.system.mapper.WmsWarehouseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 仓库管理（对应仓库）：
 * 仓库登记、分页查询与删除。
 * 仓库编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsWarehouseService {

    private static final String DEFAULT_WAREHOUSE_NO_PREFIX = "WH";
    private static final String DEFAULT_WAREHOUSE_STATUS = "DRAFT";
    private static final String DEFAULT_WAREHOUSE_TYPE = "FINISHED";

    private final WmsWarehouseMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询仓库记录：仓库类型/仓库状态精确，仓库编码/仓库名称/负责人/仓库地址模糊，按主键倒序。 */
    public PageResult<WmsWarehouse> page(WmsWarehouseQuery query) {
        Page<WmsWarehouse> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsWarehouse>lambdaQuery()
                .eq(StringUtils.hasText(query.getWarehouseType()),
                        WmsWarehouse::getWarehouseType, query.getWarehouseType())
                .eq(StringUtils.hasText(query.getWarehouseStatus()),
                        WmsWarehouse::getWarehouseStatus, query.getWarehouseStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsWarehouse::getWarehouseCode, query.getKeyword()).or()
                        .like(WmsWarehouse::getWarehouseName, query.getKeyword()).or()
                        .like(WmsWarehouse::getManager, query.getKeyword()).or()
                        .like(WmsWarehouse::getAddress, query.getKeyword()))
                .orderByDesc(WmsWarehouse::getId));
        return PageResult.of(page);
    }

    public WmsWarehouse detail(Long id) {
        return require(id);
    }

    /** 新增或更新仓库记录：新增时回填默认仓库类型、默认仓库状态与组织，仓库编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsWarehouseSaveRequest request) {
        WmsWarehouse entity;
        if (id == null) {
            entity = new WmsWarehouse();
            entity.setWarehouseCode(StringUtils.hasText(request.getWarehouseCode())
                    ? request.getWarehouseCode() : flowSupport.nextBizNo(DEFAULT_WAREHOUSE_NO_PREFIX));
            entity.setWarehouseType(StringUtils.hasText(request.getWarehouseType())
                    ? request.getWarehouseType() : DEFAULT_WAREHOUSE_TYPE);
            entity.setWarehouseStatus(StringUtils.hasText(request.getWarehouseStatus())
                    ? request.getWarehouseStatus() : DEFAULT_WAREHOUSE_STATUS);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除仓库记录：物理删除以释放仓库编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsWarehouse require(Long id) {
        WmsWarehouse entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "仓库不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、面积非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsWarehouse entity, WmsWarehouseSaveRequest request) {
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getWarehouseName())) {
            entity.setWarehouseName(request.getWarehouseName());
        }
        if (StringUtils.hasText(request.getWarehouseType())) {
            entity.setWarehouseType(request.getWarehouseType());
        }
        if (StringUtils.hasText(request.getAddress())) {
            entity.setAddress(request.getAddress());
        }
        if (StringUtils.hasText(request.getManager())) {
            entity.setManager(request.getManager());
        }
        if (StringUtils.hasText(request.getContactPhone())) {
            entity.setContactPhone(request.getContactPhone());
        }
        if (request.getArea() != null) {
            entity.setArea(request.getArea());
        }
        if (StringUtils.hasText(request.getWarehouseStatus())) {
            entity.setWarehouseStatus(request.getWarehouseStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
