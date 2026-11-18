package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinanceInvoiceQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceInvoiceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceInvoice;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinanceInvoiceService;
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
 * 发票登记接口（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 发票登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/invoices")
@RequiredArgsConstructor
public class ErpFinanceInvoiceController {

    private final ErpFinanceInvoiceService service;

    @GetMapping
    @RequirePermission("erp:finance:invoice:list")
    public ApiResponse<PageResult<ErpFinanceInvoice>> page(ErpFinanceInvoiceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:invoice:list")
    public ApiResponse<ErpFinanceInvoice> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:invoice:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinanceInvoiceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:invoice:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinanceInvoiceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:invoice:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
