package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysMfaBindingSaveRequest;
import com.huaweicloud.plm.system.entity.SysMfaBinding;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMfaBindingService;
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
 * 多因素认证绑定接口（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）：
 * MFA 绑定登记、绑定/解绑/停用状态流转。
 */
@RestController
@RequestMapping("/platform/iam/mfa-bindings")
@RequiredArgsConstructor
public class SysMfaBindingController {

    private final SysMfaBindingService service;

    @GetMapping
    @RequirePermission("platform:iam:mfa:list")
    public ApiResponse<PageResult<SysMfaBinding>> page(IamQuery query) {
        return ApiResponse.success(service.pageBindings(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:iam:mfa:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:iam:mfa:list")
    public ApiResponse<SysMfaBinding> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:iam:mfa:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMfaBindingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:iam:mfa:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMfaBindingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 绑定。 */
    @PostMapping("/{id}/bind")
    @RequirePermission("platform:iam:mfa:manage")
    public ApiResponse<SysMfaBinding> bind(@PathVariable Long id) {
        return ApiResponse.success(service.bind(id));
    }

    /** 解绑。 */
    @PostMapping("/{id}/unbind")
    @RequirePermission("platform:iam:mfa:manage")
    public ApiResponse<SysMfaBinding> unbind(@PathVariable Long id) {
        return ApiResponse.success(service.unbind(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:iam:mfa:manage")
    public ApiResponse<SysMfaBinding> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:iam:mfa:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
