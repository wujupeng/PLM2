package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizMessageTaskSaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaMessageTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMessageTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 消息总线与任务队列接口（OA-DEV-088）：任务登记、执行、失败重试与队列统计。
 */
@RestController
@RequestMapping("/oa/integration/tasks")
@RequiredArgsConstructor
public class OaMessageTaskController {

    private final OaMessageTaskService taskService;

    @GetMapping
    @RequirePermission("oa:integration:task:list")
    public ApiResponse<PageResult<OaMessageTask>> page(OaIntegrationQuery query) {
        return ApiResponse.success(taskService.page(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:integration:task:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(taskService.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:integration:task:list")
    public ApiResponse<OaMessageTask> detail(@PathVariable Long id) {
        return ApiResponse.success(taskService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:integration:task:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizMessageTaskSaveRequest request) {
        return ApiResponse.success(taskService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:integration:task:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizMessageTaskSaveRequest request) {
        taskService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:integration:task:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ApiResponse.success();
    }

    /** 执行任务（模拟执行，success 决定成功/失败）。 */
    @PostMapping("/{id}/execute")
    @RequirePermission("oa:integration:task:manage")
    public ApiResponse<OaMessageTask> execute(@PathVariable Long id,
                                              @RequestParam(defaultValue = "true") boolean success) {
        return ApiResponse.success(taskService.execute(id, success));
    }

    /** 失败任务重新入队。 */
    @PostMapping("/{id}/retry")
    @RequirePermission("oa:integration:task:manage")
    public ApiResponse<OaMessageTask> retry(@PathVariable Long id) {
        return ApiResponse.success(taskService.retry(id));
    }
}
