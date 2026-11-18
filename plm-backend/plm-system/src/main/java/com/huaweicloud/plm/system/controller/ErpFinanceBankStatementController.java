package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinanceBankStatementQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceBankStatementSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceBankStatement;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinanceBankStatementService;
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
 * 银行对账单接口（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 银行对账单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/bank-statements")
@RequiredArgsConstructor
public class ErpFinanceBankStatementController {

    private final ErpFinanceBankStatementService service;

    @GetMapping
    @RequirePermission("erp:finance:bank-statement:list")
    public ApiResponse<PageResult<ErpFinanceBankStatement>> page(ErpFinanceBankStatementQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:bank-statement:list")
    public ApiResponse<ErpFinanceBankStatement> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:bank-statement:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinanceBankStatementSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:bank-statement:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinanceBankStatementSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:bank-statement:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
