package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysFieldPermissionSaveRequest;
import com.huaweicloud.plm.system.entity.SysFieldPermission;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysFieldPermissionService;
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

import java.util.Map;

/**
 * 字段级权限接口（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 字段可见性/脱敏级别登记、启停状态流转。
 */
@RestController
@RequestMapping("/platform/iam/field-permissions")
@RequiredArgsConstructor
public class SysFieldPermissionController {

    private final SysFieldPermissionService service;

    @GetMapping
    @RequirePermission("platform:iam:fieldperm:list")
    public ApiResponse<PageResult<SysFieldPermission>> page(IamQuery query) {
        return ApiResponse.success(service.pagePermissions(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:iam:fieldperm:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:iam:fieldperm:list")
    public ApiResponse<SysFieldPermission> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:iam:fieldperm:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysFieldPermissionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:iam:fieldperm:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysFieldPermissionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:iam:fieldperm:manage")
    public ApiResponse<SysFieldPermission> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:iam:fieldperm:manage")
    public ApiResponse<SysFieldPermission> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:iam:fieldperm:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
