package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysSodRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysSodRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysSodRuleService;
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
 * 职责分离规则接口（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 互斥角色/权限对登记、启停状态流转。
 */
@RestController
@RequestMapping("/platform/iam/sod-rules")
@RequiredArgsConstructor
public class SysSodRuleController {

    private final SysSodRuleService service;

    @GetMapping
    @RequirePermission("platform:iam:sodrule:list")
    public ApiResponse<PageResult<SysSodRule>> page(IamQuery query) {
        return ApiResponse.success(service.pageRules(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:iam:sodrule:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:iam:sodrule:list")
    public ApiResponse<SysSodRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:iam:sodrule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysSodRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:iam:sodrule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysSodRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:iam:sodrule:manage")
    public ApiResponse<SysSodRule> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:iam:sodrule:manage")
    public ApiResponse<SysSodRule> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:iam:sodrule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
