package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpSalesOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpSalesOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpSalesOrderQuery;
import com.huaweicloud.plm.system.dto.ErpSalesOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpSalesOrderService;
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
 * 销售订单接口（G3-N2 ERP 销售管理）：
 * 销售订单头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/sales/orders")
@RequiredArgsConstructor
public class ErpSalesOrderController {

    private final ErpSalesOrderService service;

    @GetMapping
    @RequirePermission("erp:sales:order:list")
    public ApiResponse<PageResult<ErpSalesOrder>> page(ErpSalesOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:order:list")
    public ApiResponse<ErpSalesOrderDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:order:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpSalesOrderSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:order:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpSalesOrderSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:order:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:sales:order:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpSalesOrderLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:sales:order:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpSalesOrderLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:sales:order:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
