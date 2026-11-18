package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinanceAccountQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceAccountSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceAccount;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinanceAccountService;
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
 * 会计科目接口（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）：
 * 会计科目登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/accounts")
@RequiredArgsConstructor
public class ErpFinanceAccountController {

    private final ErpFinanceAccountService service;

    @GetMapping
    @RequirePermission("erp:finance:account:list")
    public ApiResponse<PageResult<ErpFinanceAccount>> page(ErpFinanceAccountQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:account:list")
    public ApiResponse<ErpFinanceAccount> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:account:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinanceAccountSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:account:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinanceAccountSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:account:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
