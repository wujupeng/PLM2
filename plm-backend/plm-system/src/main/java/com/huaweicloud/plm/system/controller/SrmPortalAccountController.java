package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmPortalAccountQuery;
import com.huaweicloud.plm.system.dto.SrmPortalAccountSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPortalAccount;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmPortalAccountService;
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
 * 供应商门户账号接口（对应供应商门户账号）：
 * 门户账号登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/portal/accounts")
@RequiredArgsConstructor
public class SrmPortalAccountController {

    private final SrmPortalAccountService service;

    @GetMapping
    @RequirePermission("srm:portal:account:list")
    public ApiResponse<PageResult<SrmPortalAccount>> page(SrmPortalAccountQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:portal:account:list")
    public ApiResponse<SrmPortalAccount> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:portal:account:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmPortalAccountSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:portal:account:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmPortalAccountSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:portal:account:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
