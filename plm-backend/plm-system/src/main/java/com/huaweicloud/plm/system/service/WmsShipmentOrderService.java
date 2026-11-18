package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsShipmentOrderQuery;
import com.huaweicloud.plm.system.dto.WmsShipmentOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsShipmentOrder;
import com.huaweicloud.plm.system.mapper.WmsShipmentOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 发运单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsShipmentOrderService {

    private static final String DEFAULT_NO_PREFIX = "SHP";
    private static final String DEFAULT_SHIPMENT_TYPE = "SALES";
    private static final String DEFAULT_SHIPMENT_STATUS = "DRAFT";

    private final WmsShipmentOrderMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsShipmentOrder> page(WmsShipmentOrderQuery query) {
        String keyword = query.getKeyword();
        Page<WmsShipmentOrder> page = mapper.selectPage(query.toPage(), Wrappers.<WmsShipmentOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getShipmentStatus()), WmsShipmentOrder::getShipmentStatus, query.getShipmentStatus())
                .eq(StringUtils.hasText(query.getShipmentType()), WmsShipmentOrder::getShipmentType, query.getShipmentType())
                .eq(StringUtils.hasText(query.getCustomerCode()), WmsShipmentOrder::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsShipmentOrder::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsShipmentOrder::getShipmentNo, keyword).or()
                        .like(WmsShipmentOrder::getCustomerName, keyword).or()
                        .like(WmsShipmentOrder::getMaterialCode, keyword).or()
                        .like(WmsShipmentOrder::getMaterialName, keyword))
                .orderByDesc(WmsShipmentOrder::getId));
        return PageResult.of(page);
    }

    public WmsShipmentOrder detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsShipmentOrderSaveRequest request) {
        WmsShipmentOrder entity;
        if (id == null) {
            entity = new WmsShipmentOrder();
            entity.setShipmentNo(StringUtils.hasText(request.getShipmentNo())
                    ? request.getShipmentNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setShipmentType(StringUtils.hasText(request.getShipmentType())
                    ? request.getShipmentType() : DEFAULT_SHIPMENT_TYPE);
            entity.setShipmentStatus(StringUtils.hasText(request.getShipmentStatus())
                    ? request.getShipmentStatus() : DEFAULT_SHIPMENT_STATUS);
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

    private WmsShipmentOrder require(Long id) {
        WmsShipmentOrder entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "发运单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsShipmentOrder entity, WmsShipmentOrderSaveRequest request) {
        if (StringUtils.hasText(request.getShipmentNo())) {
            entity.setShipmentNo(request.getShipmentNo());
        }
        if (StringUtils.hasText(request.getShipmentType())) {
            entity.setShipmentType(request.getShipmentType());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getCustomerName())) {
            entity.setCustomerName(request.getCustomerName());
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
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getShippedQty() != null) {
            entity.setShippedQty(request.getShippedQty());
        }
        if (StringUtils.hasText(request.getCarrier())) {
            entity.setCarrier(request.getCarrier());
        }
        if (StringUtils.hasText(request.getVehicleNo())) {
            entity.setVehicleNo(request.getVehicleNo());
        }
        if (StringUtils.hasText(request.getDriverName())) {
            entity.setDriverName(request.getDriverName());
        }
        if (StringUtils.hasText(request.getDriverPhone())) {
            entity.setDriverPhone(request.getDriverPhone());
        }
        if (StringUtils.hasText(request.getDeliveryAddress())) {
            entity.setDeliveryAddress(request.getDeliveryAddress());
        }
        if (StringUtils.hasText(request.getShipmentStatus())) {
            entity.setShipmentStatus(request.getShipmentStatus());
        }
        if (StringUtils.hasText(request.getLoadBy())) {
            entity.setLoadBy(request.getLoadBy());
        }
        if (request.getLoadTime() != null) {
            entity.setLoadTime(request.getLoadTime());
        }
        if (StringUtils.hasText(request.getShipBy())) {
            entity.setShipBy(request.getShipBy());
        }
        if (request.getShipTime() != null) {
            entity.setShipTime(request.getShipTime());
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
