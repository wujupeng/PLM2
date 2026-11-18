package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysEventMessageSaveRequest;
import com.huaweicloud.plm.system.entity.SysEventMessage;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysEventMessageService;
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
 * 事件消息接口（G1-N1 集成平台 WBS T009）：事件发布、投递结果、重试与死信标记。
 */
@RestController
@RequestMapping("/platform/integration/event-messages")
@RequiredArgsConstructor
public class SysEventMessageController {

    private final SysEventMessageService service;

    @GetMapping
    @RequirePermission("platform:integration:message:list")
    public ApiResponse<PageResult<SysEventMessage>> page(IntegrationQuery query) {
        return ApiResponse.success(service.pageMessages(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:integration:message:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:integration:message:list")
    public ApiResponse<SysEventMessage> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:integration:message:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysEventMessageSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:integration:message:manage")
    public ApiResponse<Long> update(@PathVariable Long id,
                                    @Valid @RequestBody SysEventMessageSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 发布消息。 */
    @PostMapping("/{id}/publish")
    @RequirePermission("platform:integration:message:manage")
    public ApiResponse<SysEventMessage> publish(@PathVariable Long id) {
        return ApiResponse.success(service.publish(id));
    }

    /** 重试消息。 */
    @PostMapping("/{id}/retry")
    @RequirePermission("platform:integration:message:manage")
    public ApiResponse<SysEventMessage> retry(@PathVariable Long id) {
        return ApiResponse.success(service.retry(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:integration:message:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
