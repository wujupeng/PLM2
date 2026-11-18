package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysEventTopicSaveRequest;
import com.huaweicloud.plm.system.entity.SysEventTopic;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysEventTopicService;
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
 * 事件主题接口（G1-N1 集成平台 T009）：主题登记、启用与停用。
 */
@RestController
@RequestMapping("/platform/integration/event-topics")
@RequiredArgsConstructor
public class SysEventTopicController {

    private final SysEventTopicService service;

    @GetMapping
    @RequirePermission("platform:integration:topic:list")
    public ApiResponse<PageResult<SysEventTopic>> page(IntegrationQuery query) {
        return ApiResponse.success(service.pageTopics(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:integration:topic:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:integration:topic:list")
    public ApiResponse<SysEventTopic> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:integration:topic:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysEventTopicSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:integration:topic:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysEventTopicSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用主题。 */
    @PostMapping("/{id}/publish")
    @RequirePermission("platform:integration:topic:manage")
    public ApiResponse<SysEventTopic> publish(@PathVariable Long id) {
        return ApiResponse.success(service.publish(id));
    }

    /** 停用主题。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:integration:topic:manage")
    public ApiResponse<SysEventTopic> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:integration:topic:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
