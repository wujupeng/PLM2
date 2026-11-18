package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsShipmentOrderQuery;
import com.huaweicloud.plm.system.dto.WmsShipmentOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsShipmentOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsShipmentOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 发运单接口：发运单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/outbound/shipments")
@RequiredArgsConstructor
public class WmsShipmentOrderController {

    private final WmsShipmentOrderService service;

    @GetMapping
    @RequirePermission("wms:outbound:shipment:list")
    public ApiResponse<PageResult<WmsShipmentOrder>> page(WmsShipmentOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:outbound:shipment:list")
    public ApiResponse<WmsShipmentOrder> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:outbound:shipment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsShipmentOrderSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:outbound:shipment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsShipmentOrderSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:outbound:shipment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
