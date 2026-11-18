package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinancePaymentQuery;
import com.huaweicloud.plm.system.dto.ErpFinancePaymentSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinancePayment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinancePaymentService;
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
 * 收付款单接口（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 收付款登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/payments")
@RequiredArgsConstructor
public class ErpFinancePaymentController {

    private final ErpFinancePaymentService service;

    @GetMapping
    @RequirePermission("erp:finance:payment:list")
    public ApiResponse<PageResult<ErpFinancePayment>> page(ErpFinancePaymentQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:payment:list")
    public ApiResponse<ErpFinancePayment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:payment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinancePaymentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:payment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinancePaymentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:payment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
