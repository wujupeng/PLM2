package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ApprovalConditionQuery;
import com.huaweicloud.plm.system.dto.SysApprovalConditionSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalCondition;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysApprovalConditionService;
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
 * 审批条件接口（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 审批条件登记、启停状态流转与统计。
 */
@RestController
@RequestMapping("/platform/approval/conditions")
@RequiredArgsConstructor
public class SysApprovalConditionController {

    private final SysApprovalConditionService service;

    @GetMapping
    @RequirePermission("platform:approval:condition:list")
    public ApiResponse<PageResult<SysApprovalCondition>> page(ApprovalConditionQuery query) {
        return ApiResponse.success(service.pageConditions(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:approval:condition:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:approval:condition:list")
    public ApiResponse<SysApprovalCondition> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:approval:condition:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysApprovalConditionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:approval:condition:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysApprovalConditionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:approval:condition:manage")
    public ApiResponse<SysApprovalCondition> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:approval:condition:manage")
    public ApiResponse<SysApprovalCondition> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:approval:condition:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
