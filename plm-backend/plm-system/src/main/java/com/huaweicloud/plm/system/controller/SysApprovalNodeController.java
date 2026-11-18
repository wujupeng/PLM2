package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ApprovalNodeQuery;
import com.huaweicloud.plm.system.dto.SysApprovalNodeSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalNode;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysApprovalNodeService;
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
 * 审批节点接口（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 审批节点登记、启停状态流转与统计。
 */
@RestController
@RequestMapping("/platform/approval/nodes")
@RequiredArgsConstructor
public class SysApprovalNodeController {

    private final SysApprovalNodeService service;

    @GetMapping
    @RequirePermission("platform:approval:node:list")
    public ApiResponse<PageResult<SysApprovalNode>> page(ApprovalNodeQuery query) {
        return ApiResponse.success(service.pageNodes(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:approval:node:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:approval:node:list")
    public ApiResponse<SysApprovalNode> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:approval:node:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysApprovalNodeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:approval:node:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysApprovalNodeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:approval:node:manage")
    public ApiResponse<SysApprovalNode> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:approval:node:manage")
    public ApiResponse<SysApprovalNode> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:approval:node:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
