package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinanceReceivableQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceReceivableSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceReceivable;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinanceReceivableService;
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
 * 应收单接口（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 应收登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/receivables")
@RequiredArgsConstructor
public class ErpFinanceReceivableController {

    private final ErpFinanceReceivableService service;

    @GetMapping
    @RequirePermission("erp:finance:receivable:list")
    public ApiResponse<PageResult<ErpFinanceReceivable>> page(ErpFinanceReceivableQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:receivable:list")
    public ApiResponse<ErpFinanceReceivable> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:receivable:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinanceReceivableSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:receivable:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinanceReceivableSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:receivable:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
