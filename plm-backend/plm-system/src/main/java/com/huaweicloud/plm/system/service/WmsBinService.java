package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsBinQuery;
import com.huaweicloud.plm.system.dto.WmsBinSaveRequest;
import com.huaweicloud.plm.system.entity.WmsBin;
import com.huaweicloud.plm.system.mapper.WmsBinMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * WMS 仓储基础—库位管理（对应库位）：
 * 库位登记、分页查询与删除。
 * 库位编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsBinService {

    private static final String DEFAULT_BIN_NO_PREFIX = "BIN";
    private static final String DEFAULT_BIN_TYPE = "STORAGE";
    private static final String DEFAULT_BIN_STATUS = "IDLE";

    private final WmsBinMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库位记录：库位类型/库位状态/所属仓库编码/所属库区编码精确，库位编码/库位名称/所属仓库编码/所属库区编码/条码模糊，按主键倒序。 */
    public PageResult<WmsBin> page(WmsBinQuery query) {
        Page<WmsBin> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsBin>lambdaQuery()
                .eq(StringUtils.hasText(query.getBinType()),
                        WmsBin::getBinType, query.getBinType())
                .eq(StringUtils.hasText(query.getBinStatus()),
                        WmsBin::getBinStatus, query.getBinStatus())
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        WmsBin::getWarehouseCode, query.getWarehouseCode())
                .eq(StringUtils.hasText(query.getZoneCode()),
                        WmsBin::getZoneCode, query.getZoneCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsBin::getBinCode, query.getKeyword()).or()
                        .like(WmsBin::getBinName, query.getKeyword()).or()
                        .like(WmsBin::getWarehouseCode, query.getKeyword()).or()
                        .like(WmsBin::getZoneCode, query.getKeyword()).or()
                        .like(WmsBin::getBarcode, query.getKeyword()))
                .orderByDesc(WmsBin::getId));
        return PageResult.of(page);
    }

    public WmsBin detail(Long id) {
        return require(id);
    }

    /** 新增或更新库位记录：新增时回填默认库位类型、库位状态与组织，库位编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsBinSaveRequest request) {
        WmsBin entity;
        if (id == null) {
            entity = new WmsBin();
            entity.setBinCode(StringUtils.hasText(request.getBinCode())
                    ? request.getBinCode() : flowSupport.nextBizNo(DEFAULT_BIN_NO_PREFIX));
            entity.setBinType(StringUtils.hasText(request.getBinType())
                    ? request.getBinType() : DEFAULT_BIN_TYPE);
            entity.setBinStatus(StringUtils.hasText(request.getBinStatus())
                    ? request.getBinStatus() : DEFAULT_BIN_STATUS);
            entity.setUsedCapacity(request.getUsedCapacity() != null
                    ? request.getUsedCapacity() : BigDecimal.ZERO);
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

    /** 删除库位记录：物理删除以释放库位编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsBin require(Long id) {
        WmsBin entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库位不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsBin entity, WmsBinSaveRequest request) {
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
        }
        if (StringUtils.hasText(request.getBinName())) {
            entity.setBinName(request.getBinName());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getZoneCode())) {
            entity.setZoneCode(request.getZoneCode());
        }
        if (StringUtils.hasText(request.getBinType())) {
            entity.setBinType(request.getBinType());
        }
        if (request.getMaxCapacity() != null) {
            entity.setMaxCapacity(request.getMaxCapacity());
        }
        if (request.getUsedCapacity() != null) {
            entity.setUsedCapacity(request.getUsedCapacity());
        }
        if (StringUtils.hasText(request.getCapacityUnit())) {
            entity.setCapacityUnit(request.getCapacityUnit());
        }
        if (StringUtils.hasText(request.getBarcode())) {
            entity.setBarcode(request.getBarcode());
        }
        if (StringUtils.hasText(request.getBinStatus())) {
            entity.setBinStatus(request.getBinStatus());
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
