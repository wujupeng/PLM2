package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpSalesInvoiceQuery;
import com.huaweicloud.plm.system.dto.ErpSalesInvoiceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesInvoice;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpSalesInvoiceService;
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
 * 销售发票接口（G3-N2 ERP 销售管理）：
 * 销售发票登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/sales/invoices")
@RequiredArgsConstructor
public class ErpSalesInvoiceController {

    private final ErpSalesInvoiceService service;

    @GetMapping
    @RequirePermission("erp:sales:invoice:list")
    public ApiResponse<PageResult<ErpSalesInvoice>> page(ErpSalesInvoiceQuery query) {
        return ApiResponse.success(service.pageInvoices(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:invoice:list")
    public ApiResponse<ErpSalesInvoice> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:invoice:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpSalesInvoiceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:invoice:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpSalesInvoiceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:invoice:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
