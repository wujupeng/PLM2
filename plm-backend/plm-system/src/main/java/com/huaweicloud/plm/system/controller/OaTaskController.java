package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.TaskApproveRequest;
import com.huaweicloud.plm.system.dto.TaskItemResponse;
import com.huaweicloud.plm.system.dto.TaskQuery;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaTaskService;
import com.huaweicloud.plm.system.service.WorkflowEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oa/tasks")
@RequiredArgsConstructor
public class OaTaskController {

    private final OaTaskService taskService;
    private final WorkflowEngineService workflowEngineService;

    /** 我的待办：默认查询当前登录用户待处理的任务。 */
    @GetMapping("/todo")
    @RequirePermission("oa:task:list")
    public ApiResponse<PageResult<TaskItemResponse>> pageTodo(TaskQuery query) {
        return ApiResponse.success(taskService.pageTodo(query));
    }

    /** 我的已办：默认查询当前登录用户已同意或已驳回的任务。 */
    @GetMapping("/done")
    @RequirePermission("oa:task:list")
    public ApiResponse<PageResult<TaskItemResponse>> pageDone(TaskQuery query) {
        return ApiResponse.success(taskService.pageDone(query));
    }

    /** 处理审批任务：同意或驳回。 */
    @PostMapping("/{taskId}/approve")
    @RequirePermission("oa:task:approve")
    public ApiResponse<Void> approve(@PathVariable Long taskId,
                                     @Valid @RequestBody TaskApproveRequest request) {
        workflowEngineService.approve(taskId, request);
        return ApiResponse.success();
    }
}
