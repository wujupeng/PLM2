package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysMfaVerifyLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysMfaVerifyLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMfaVerifyLogService;
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
 * MFA 校验日志接口（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份 / 敏感操作追踪）：
 * 多因素认证校验留痕登记与查询。
 */
@RestController
@RequestMapping("/platform/iam/mfa-verify-logs")
@RequiredArgsConstructor
public class SysMfaVerifyLogController {

    private final SysMfaVerifyLogService service;

    @GetMapping
    @RequirePermission("platform:iam:mfaverify:list")
    public ApiResponse<PageResult<SysMfaVerifyLog>> page(IamQuery query) {
        return ApiResponse.success(service.pageLogs(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:iam:mfaverify:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:iam:mfaverify:list")
    public ApiResponse<SysMfaVerifyLog> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:iam:mfaverify:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMfaVerifyLogSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:iam:mfaverify:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMfaVerifyLogSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:iam:mfaverify:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
