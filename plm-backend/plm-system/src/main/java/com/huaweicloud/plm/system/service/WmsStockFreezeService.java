package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsStockFreezeQuery;
import com.huaweicloud.plm.system.dto.WmsStockFreezeSaveRequest;
import com.huaweicloud.plm.system.entity.WmsStockFreeze;
import com.huaweicloud.plm.system.mapper.WmsStockFreezeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 库存冻结服务（对应库存冻结）。
 */
@Service
@RequiredArgsConstructor
public class WmsStockFreezeService {

    private static final String DEFAULT_NO_PREFIX = "FRZ";
    private static final String DEFAULT_FREEZE_TYPE = "FREEZE";
    private static final String DEFAULT_FREEZE_STATUS = "FROZEN";

    private final WmsStockFreezeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsStockFreeze> page(WmsStockFreezeQuery query) {
        String keyword = query.getKeyword();
        Page<WmsStockFreeze> page = mapper.selectPage(query.toPage(), Wrappers.<WmsStockFreeze>lambdaQuery()
                .eq(StringUtils.hasText(query.getFreezeStatus()), WmsStockFreeze::getFreezeStatus, query.getFreezeStatus())
                .eq(StringUtils.hasText(query.getFreezeType()), WmsStockFreeze::getFreezeType, query.getFreezeType())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsStockFreeze::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), WmsStockFreeze::getBatchNo, query.getBatchNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsStockFreeze::getFreezeNo, keyword).or()
                        .like(WmsStockFreeze::getMaterialCode, keyword).or()
                        .like(WmsStockFreeze::getMaterialName, keyword).or()
                        .like(WmsStockFreeze::getBatchNo, keyword))
                .orderByDesc(WmsStockFreeze::getId));
        return PageResult.of(page);
    }

    public WmsStockFreeze detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsStockFreezeSaveRequest request) {
        WmsStockFreeze entity;
        if (id == null) {
            entity = new WmsStockFreeze();
            entity.setFreezeNo(StringUtils.hasText(request.getFreezeNo())
                    ? request.getFreezeNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setFreezeType(StringUtils.hasText(request.getFreezeType())
                    ? request.getFreezeType()
                    : DEFAULT_FREEZE_TYPE);
            entity.setFreezeStatus(StringUtils.hasText(request.getFreezeStatus())
                    ? request.getFreezeStatus()
                    : DEFAULT_FREEZE_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private WmsStockFreeze require(Long id) {
        WmsStockFreeze entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存冻结单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsStockFreeze entity, WmsStockFreezeSaveRequest request) {
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
        }
        if (request.getFreezeQty() != null) {
            entity.setFreezeQty(request.getFreezeQty());
        }
        if (StringUtils.hasText(request.getFreezeReason())) {
            entity.setFreezeReason(request.getFreezeReason());
        }
        if (StringUtils.hasText(request.getFreezeType())) {
            entity.setFreezeType(request.getFreezeType());
        }
        if (StringUtils.hasText(request.getFreezeStatus())) {
            entity.setFreezeStatus(request.getFreezeStatus());
        }
        if (StringUtils.hasText(request.getApplyBy())) {
            entity.setApplyBy(request.getApplyBy());
        }
        if (request.getApplyTime() != null) {
            entity.setApplyTime(request.getApplyTime());
        }
        if (StringUtils.hasText(request.getReleaseBy())) {
            entity.setReleaseBy(request.getReleaseBy());
        }
        if (request.getReleaseTime() != null) {
            entity.setReleaseTime(request.getReleaseTime());
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
