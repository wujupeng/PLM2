package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.CollabTaskQuery;
import com.huaweicloud.plm.system.dto.CollabTaskSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaCollabTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaCollabTaskService;
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

/**
 * 协作任务接口（OA-DEV-060）：团队任务维护与状态流转。
 */
@RestController
@RequestMapping("/oa/collab-tasks")
@RequiredArgsConstructor
public class OaCollabTaskController {

    private final OaCollabTaskService collabTaskService;

    /** 协作任务分页：传入 ownerUserId 时仅返回该负责人的任务。 */
    @GetMapping
    @RequirePermission("oa:collab:task")
    public ApiResponse<PageResult<OaOaCollabTask>> page(CollabTaskQuery query) {
        return ApiResponse.success(collabTaskService.page(query, query.getOwnerUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:collab:task")
    public ApiResponse<OaOaCollabTask> detail(@PathVariable Long id) {
        return ApiResponse.success(collabTaskService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:collab:task")
    public ApiResponse<Long> create(@Valid @RequestBody CollabTaskSaveRequest request) {
        return ApiResponse.success(collabTaskService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:collab:task")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody CollabTaskSaveRequest request) {
        collabTaskService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:collab:task")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        collabTaskService.delete(id);
        return ApiResponse.success();
    }
}
