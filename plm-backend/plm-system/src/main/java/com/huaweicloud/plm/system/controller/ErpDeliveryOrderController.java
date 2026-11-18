package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderQuery;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDeliveryOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpDeliveryOrderService;
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
 * 发货单接口（G3-N2 ERP 销售管理）：
 * 发货单头与发货行的登记、查询与删除。
 */
@RestController
@RequestMapping("/erp/sales/deliveries")
@RequiredArgsConstructor
public class ErpDeliveryOrderController {

    private final ErpDeliveryOrderService service;

    @GetMapping
    @RequirePermission("erp:sales:delivery:list")
    public ApiResponse<PageResult<ErpDeliveryOrder>> page(ErpDeliveryOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:delivery:list")
    public ApiResponse<ErpDeliveryOrderDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:delivery:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpDeliveryOrderSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:delivery:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpDeliveryOrderSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:delivery:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:sales:delivery:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId,
                                     @Valid @RequestBody ErpDeliveryOrderLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:sales:delivery:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId,
                                        @Valid @RequestBody ErpDeliveryOrderLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:sales:delivery:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
