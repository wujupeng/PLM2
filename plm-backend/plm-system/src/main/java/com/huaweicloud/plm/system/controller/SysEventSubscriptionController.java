package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysEventSubscriptionSaveRequest;
import com.huaweicloud.plm.system.entity.SysEventSubscription;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysEventSubscriptionService;
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
 * 事件订阅接口（G1-N1 集成平台 WBS T009）：订阅关系、投递方式、重试策略与联通测试。
 */
@RestController
@RequestMapping("/platform/integration/event-subscriptions")
@RequiredArgsConstructor
public class SysEventSubscriptionController {

    private final SysEventSubscriptionService service;

    @GetMapping
    @RequirePermission("platform:integration:subscription:list")
    public ApiResponse<PageResult<SysEventSubscription>> page(IntegrationQuery query) {
        return ApiResponse.success(service.pageSubscriptions(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:integration:subscription:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:integration:subscription:list")
    public ApiResponse<SysEventSubscription> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:integration:subscription:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysEventSubscriptionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:integration:subscription:manage")
    public ApiResponse<Long> update(@PathVariable Long id,
                                    @Valid @RequestBody SysEventSubscriptionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用订阅。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:integration:subscription:manage")
    public ApiResponse<SysEventSubscription> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用订阅。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:integration:subscription:manage")
    public ApiResponse<SysEventSubscription> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    /** 联通测试。 */
    @PostMapping("/{id}/test")
    @RequirePermission("platform:integration:subscription:manage")
    public ApiResponse<SysEventSubscription> test(@PathVariable Long id) {
        return ApiResponse.success(service.test(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:integration:subscription:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
