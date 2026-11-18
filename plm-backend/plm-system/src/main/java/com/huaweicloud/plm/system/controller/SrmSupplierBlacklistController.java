package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierBlacklistQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierBlacklistSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierBlacklist;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierBlacklistService;
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
 * 供应商黑名单接口（对应 G4-N1，WBS T031）：
 * 黑名单记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/supplier-blacklists")
@RequiredArgsConstructor
public class SrmSupplierBlacklistController {

    private final SrmSupplierBlacklistService service;

    @GetMapping
    @RequirePermission("srm:supplier:blacklist:list")
    public ApiResponse<PageResult<SrmSupplierBlacklist>> page(SrmSupplierBlacklistQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:supplier:blacklist:list")
    public ApiResponse<SrmSupplierBlacklist> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:supplier:blacklist:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierBlacklistSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:supplier:blacklist:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierBlacklistSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:supplier:blacklist:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
