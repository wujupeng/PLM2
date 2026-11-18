package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsTransferOrderQuery;
import com.huaweicloud.plm.system.dto.WmsTransferOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsTransferOrder;
import com.huaweicloud.plm.system.mapper.WmsTransferOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 调拨单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsTransferOrderService {

    private static final String DEFAULT_NO_PREFIX = "TRF";
    private static final String DEFAULT_TRANSFER_TYPE = "WAREHOUSE";
    private static final String DEFAULT_TRANSFER_STATUS = "DRAFT";

    private final WmsTransferOrderMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsTransferOrder> page(WmsTransferOrderQuery query) {
        String keyword = query.getKeyword();
        Page<WmsTransferOrder> page = mapper.selectPage(query.toPage(), Wrappers.<WmsTransferOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getTransferStatus()), WmsTransferOrder::getTransferStatus, query.getTransferStatus())
                .eq(StringUtils.hasText(query.getTransferType()), WmsTransferOrder::getTransferType, query.getTransferType())
                .eq(StringUtils.hasText(query.getFromWarehouseCode()), WmsTransferOrder::getFromWarehouseCode, query.getFromWarehouseCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsTransferOrder::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsTransferOrder::getTransferNo, keyword).or()
                        .like(WmsTransferOrder::getFromWarehouseCode, keyword).or()
                        .like(WmsTransferOrder::getToWarehouseCode, keyword).or()
                        .like(WmsTransferOrder::getMaterialCode, keyword).or()
                        .like(WmsTransferOrder::getMaterialName, keyword))
                .orderByDesc(WmsTransferOrder::getId));
        return PageResult.of(page);
    }

    public WmsTransferOrder detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsTransferOrderSaveRequest request) {
        WmsTransferOrder entity;
        if (id == null) {
            entity = new WmsTransferOrder();
            entity.setTransferNo(StringUtils.hasText(request.getTransferNo())
                    ? request.getTransferNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setTransferType(StringUtils.hasText(request.getTransferType())
                    ? request.getTransferType() : DEFAULT_TRANSFER_TYPE);
            entity.setTransferStatus(StringUtils.hasText(request.getTransferStatus())
                    ? request.getTransferStatus() : DEFAULT_TRANSFER_STATUS);
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

    private WmsTransferOrder require(Long id) {
        WmsTransferOrder entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "调拨单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsTransferOrder entity, WmsTransferOrderSaveRequest request) {
        if (StringUtils.hasText(request.getTransferNo())) {
            entity.setTransferNo(request.getTransferNo());
        }
        if (StringUtils.hasText(request.getTransferType())) {
            entity.setTransferType(request.getTransferType());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getFromWarehouseCode())) {
            entity.setFromWarehouseCode(request.getFromWarehouseCode());
        }
        if (StringUtils.hasText(request.getFromBinCode())) {
            entity.setFromBinCode(request.getFromBinCode());
        }
        if (StringUtils.hasText(request.getToWarehouseCode())) {
            entity.setToWarehouseCode(request.getToWarehouseCode());
        }
        if (StringUtils.hasText(request.getToBinCode())) {
            entity.setToBinCode(request.getToBinCode());
        }
        if (request.getTransferQty() != null) {
            entity.setTransferQty(request.getTransferQty());
        }
        if (request.getReceivedQty() != null) {
            entity.setReceivedQty(request.getReceivedQty());
        }
        if (StringUtils.hasText(request.getTransferStatus())) {
            entity.setTransferStatus(request.getTransferStatus());
        }
        if (StringUtils.hasText(request.getApplyBy())) {
            entity.setApplyBy(request.getApplyBy());
        }
        if (request.getApplyTime() != null) {
            entity.setApplyTime(request.getApplyTime());
        }
        if (StringUtils.hasText(request.getTransferBy())) {
            entity.setTransferBy(request.getTransferBy());
        }
        if (request.getTransferTime() != null) {
            entity.setTransferTime(request.getTransferTime());
        }
        if (StringUtils.hasText(request.getReceiveBy())) {
            entity.setReceiveBy(request.getReceiveBy());
        }
        if (request.getReceiveTime() != null) {
            entity.setReceiveTime(request.getReceiveTime());
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
