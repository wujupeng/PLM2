package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsRackQuery;
import com.huaweicloud.plm.system.dto.WmsRackSaveRequest;
import com.huaweicloud.plm.system.entity.WmsRack;
import com.huaweicloud.plm.system.mapper.WmsRackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * WMS 基础数据—货架管理（对应货架）：
 * 货架登记、分页查询与删除。
 * 货架编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsRackService {

    private static final String DEFAULT_RACK_NO_PREFIX = "RCK";
    private static final String DEFAULT_RACK_TYPE = "SHELF";
    private static final String DEFAULT_RACK_STATUS = "DRAFT";
    private static final Integer DEFAULT_LAYER_COUNT = 0;
    private static final Integer DEFAULT_BIN_COUNT = 0;

    private final WmsRackMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询货架记录：货架状态/仓库编码/库区编码精确，货架编码/货架名称/仓库编码/库区编码/条码模糊，按主键倒序。 */
    public PageResult<WmsRack> page(WmsRackQuery query) {
        Page<WmsRack> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsRack>lambdaQuery()
                .eq(StringUtils.hasText(query.getRackStatus()),
                        WmsRack::getRackStatus, query.getRackStatus())
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        WmsRack::getWarehouseCode, query.getWarehouseCode())
                .eq(StringUtils.hasText(query.getZoneCode()),
                        WmsRack::getZoneCode, query.getZoneCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsRack::getRackCode, query.getKeyword()).or()
                        .like(WmsRack::getRackName, query.getKeyword()).or()
                        .like(WmsRack::getWarehouseCode, query.getKeyword()).or()
                        .like(WmsRack::getZoneCode, query.getKeyword()).or()
                        .like(WmsRack::getBarcode, query.getKeyword()))
                .orderByDesc(WmsRack::getId));
        return PageResult.of(page);
    }

    public WmsRack detail(Long id) {
        return require(id);
    }

    /** 新增或更新货架记录：新增时回填默认货架类型、状态、层数、货位数与组织，货架编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsRackSaveRequest request) {
        WmsRack entity;
        if (id == null) {
            entity = new WmsRack();
            entity.setRackCode(StringUtils.hasText(request.getRackCode())
                    ? request.getRackCode() : flowSupport.nextBizNo(DEFAULT_RACK_NO_PREFIX));
            entity.setRackType(StringUtils.hasText(request.getRackType())
                    ? request.getRackType() : DEFAULT_RACK_TYPE);
            entity.setRackStatus(StringUtils.hasText(request.getRackStatus())
                    ? request.getRackStatus() : DEFAULT_RACK_STATUS);
            entity.setLayerCount(request.getLayerCount() != null
                    ? request.getLayerCount() : DEFAULT_LAYER_COUNT);
            entity.setBinCount(request.getBinCount() != null
                    ? request.getBinCount() : DEFAULT_BIN_COUNT);
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

    /** 删除货架记录：物理删除以释放货架编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsRack require(Long id) {
        WmsRack entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "货架不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsRack entity, WmsRackSaveRequest request) {
        if (StringUtils.hasText(request.getRackCode())) {
            entity.setRackCode(request.getRackCode());
        }
        if (StringUtils.hasText(request.getRackName())) {
            entity.setRackName(request.getRackName());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getZoneCode())) {
            entity.setZoneCode(request.getZoneCode());
        }
        if (StringUtils.hasText(request.getRackType())) {
            entity.setRackType(request.getRackType());
        }
        if (request.getLayerCount() != null) {
            entity.setLayerCount(request.getLayerCount());
        }
        if (request.getBinCount() != null) {
            entity.setBinCount(request.getBinCount());
        }
        if (request.getMaxLoad() != null) {
            entity.setMaxLoad(request.getMaxLoad());
        }
        if (StringUtils.hasText(request.getBarcode())) {
            entity.setBarcode(request.getBarcode());
        }
        if (StringUtils.hasText(request.getRackStatus())) {
            entity.setRackStatus(request.getRackStatus());
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
