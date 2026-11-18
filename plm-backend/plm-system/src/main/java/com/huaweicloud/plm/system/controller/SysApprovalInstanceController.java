package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ApprovalInstanceQuery;
import com.huaweicloud.plm.system.dto.SysApprovalInstanceSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalInstance;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysApprovalInstanceService;
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
 * 审批实例接口（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 审批实例登记、取消与统计。
 */
@RestController
@RequestMapping("/platform/approval/instances")
@RequiredArgsConstructor
public class SysApprovalInstanceController {

    private final SysApprovalInstanceService service;

    @GetMapping
    @RequirePermission("platform:approval:instance:list")
    public ApiResponse<PageResult<SysApprovalInstance>> page(ApprovalInstanceQuery query) {
        return ApiResponse.success(service.pageInstances(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:approval:instance:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:approval:instance:list")
    public ApiResponse<SysApprovalInstance> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:approval:instance:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysApprovalInstanceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:approval:instance:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysApprovalInstanceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 取消审批实例。 */
    @PostMapping("/{id}/cancel")
    @RequirePermission("platform:approval:instance:manage")
    public ApiResponse<SysApprovalInstance> cancel(@PathVariable Long id) {
        return ApiResponse.success(service.cancel(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:approval:instance:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
