package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ApprovalFlowQuery;
import com.huaweicloud.plm.system.dto.ApprovalMatchRequest;
import com.huaweicloud.plm.system.dto.SysApprovalFlowSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalFlow;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysApprovalFlowService;
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

import java.util.List;
import java.util.Map;

/**
 * 审批流定义接口（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 审批流登记、启停状态流转、生效审批流匹配与统计。
 */
@RestController
@RequestMapping("/platform/approval/flows")
@RequiredArgsConstructor
public class SysApprovalFlowController {

    private final SysApprovalFlowService service;

    @GetMapping
    @RequirePermission("platform:approval:flow:list")
    public ApiResponse<PageResult<SysApprovalFlow>> page(ApprovalFlowQuery query) {
        return ApiResponse.success(service.pageFlows(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:approval:flow:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    /** 匹配生效审批流：按单据类型与业务字段取值返回命中的流程列表。 */
    @PostMapping("/match")
    @RequirePermission("platform:approval:flow:list")
    public ApiResponse<List<SysApprovalFlow>> match(@Valid @RequestBody ApprovalMatchRequest request) {
        return ApiResponse.success(service.match(request));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:approval:flow:list")
    public ApiResponse<SysApprovalFlow> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:approval:flow:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysApprovalFlowSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:approval:flow:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysApprovalFlowSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:approval:flow:manage")
    public ApiResponse<SysApprovalFlow> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:approval:flow:manage")
    public ApiResponse<SysApprovalFlow> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:approval:flow:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
