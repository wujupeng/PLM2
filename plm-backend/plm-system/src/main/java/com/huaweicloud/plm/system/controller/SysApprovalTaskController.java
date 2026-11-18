package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ApprovalTaskActionRequest;
import com.huaweicloud.plm.system.dto.ApprovalTaskQuery;
import com.huaweicloud.plm.system.dto.SysApprovalTaskSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysApprovalTaskService;
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
 * 审批任务接口（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 审批任务登记、通过/驳回/转办/重置状态动作与统计。
 */
@RestController
@RequestMapping("/platform/approval/tasks")
@RequiredArgsConstructor
public class SysApprovalTaskController {

    private final SysApprovalTaskService service;

    @GetMapping
    @RequirePermission("platform:approval:task:list")
    public ApiResponse<PageResult<SysApprovalTask>> page(ApprovalTaskQuery query) {
        return ApiResponse.success(service.pageTasks(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:approval:task:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:approval:task:list")
    public ApiResponse<SysApprovalTask> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:approval:task:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysApprovalTaskSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:approval:task:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysApprovalTaskSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 通过。 */
    @PostMapping("/{id}/approve")
    @RequirePermission("platform:approval:task:manage")
    public ApiResponse<SysApprovalTask> approve(@PathVariable Long id,
                                                @RequestBody(required = false) ApprovalTaskActionRequest request) {
        return ApiResponse.success(service.approve(id, request));
    }

    /** 驳回。 */
    @PostMapping("/{id}/reject")
    @RequirePermission("platform:approval:task:manage")
    public ApiResponse<SysApprovalTask> reject(@PathVariable Long id,
                                               @RequestBody(required = false) ApprovalTaskActionRequest request) {
        return ApiResponse.success(service.reject(id, request));
    }

    /** 转办。 */
    @PostMapping("/{id}/transfer")
    @RequirePermission("platform:approval:task:manage")
    public ApiResponse<SysApprovalTask> transfer(@PathVariable Long id,
                                                 @RequestBody(required = false) ApprovalTaskActionRequest request) {
        return ApiResponse.success(service.transfer(id, request));
    }

    /** 重置。 */
    @PostMapping("/{id}/reset")
    @RequirePermission("platform:approval:task:manage")
    public ApiResponse<SysApprovalTask> reset(@PathVariable Long id,
                                              @RequestBody(required = false) ApprovalTaskActionRequest request) {
        return ApiResponse.success(service.reset(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:approval:task:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
