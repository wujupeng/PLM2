package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysSsoProviderSaveRequest;
import com.huaweicloud.plm.system.entity.SysSsoProvider;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysSsoProviderService;
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
 * 单点登录提供商接口（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）：
 * SSO 提供商登记、发布/停用状态流转。
 */
@RestController
@RequestMapping("/platform/iam/sso-providers")
@RequiredArgsConstructor
public class SysSsoProviderController {

    private final SysSsoProviderService service;

    @GetMapping
    @RequirePermission("platform:iam:ssoprovider:list")
    public ApiResponse<PageResult<SysSsoProvider>> page(IamQuery query) {
        return ApiResponse.success(service.pageProviders(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:iam:ssoprovider:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:iam:ssoprovider:list")
    public ApiResponse<SysSsoProvider> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:iam:ssoprovider:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysSsoProviderSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:iam:ssoprovider:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysSsoProviderSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 发布。 */
    @PostMapping("/{id}/publish")
    @RequirePermission("platform:iam:ssoprovider:manage")
    public ApiResponse<SysSsoProvider> publish(@PathVariable Long id) {
        return ApiResponse.success(service.publish(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:iam:ssoprovider:manage")
    public ApiResponse<SysSsoProvider> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:iam:ssoprovider:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
