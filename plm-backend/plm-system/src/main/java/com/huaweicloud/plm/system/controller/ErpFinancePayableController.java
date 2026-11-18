package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinancePayableQuery;
import com.huaweicloud.plm.system.dto.ErpFinancePayableSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinancePayable;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinancePayableService;
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
 * 应付单接口（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 应付登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/payables")
@RequiredArgsConstructor
public class ErpFinancePayableController {

    private final ErpFinancePayableService service;

    @GetMapping
    @RequirePermission("erp:finance:payable:list")
    public ApiResponse<PageResult<ErpFinancePayable>> page(ErpFinancePayableQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:payable:list")
    public ApiResponse<ErpFinancePayable> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:payable:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinancePayableSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:payable:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinancePayableSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:payable:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
