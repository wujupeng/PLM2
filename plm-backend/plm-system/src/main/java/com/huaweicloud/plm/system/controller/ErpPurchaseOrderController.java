package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpPurchaseOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpPurchaseOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpPurchaseOrderQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpPurchaseOrderService;
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
 * 采购订单接口（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）：
 * 采购订单头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/purchase/orders")
@RequiredArgsConstructor
public class ErpPurchaseOrderController {

    private final ErpPurchaseOrderService service;

    @GetMapping
    @RequirePermission("erp:purchase:order:list")
    public ApiResponse<PageResult<ErpPurchaseOrder>> page(ErpPurchaseOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:purchase:order:list")
    public ApiResponse<ErpPurchaseOrderDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:purchase:order:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpPurchaseOrderSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:purchase:order:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpPurchaseOrderSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:purchase:order:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:purchase:order:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpPurchaseOrderLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:purchase:order:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpPurchaseOrderLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:purchase:order:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
