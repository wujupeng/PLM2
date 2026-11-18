package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysIntegrationMonitorSaveRequest;
import com.huaweicloud.plm.system.entity.SysIntegrationMonitor;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysIntegrationMonitorService;
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
 * 集成监控接口（G1-N1 集成平台，WBS T009）：调用量/耗时汇总、健康度与告警。
 */
@RestController
@RequestMapping("/platform/integration/monitor")
@RequiredArgsConstructor
public class SysIntegrationMonitorController {

    private final SysIntegrationMonitorService service;

    @GetMapping
    @RequirePermission("platform:integration:monitor:list")
    public ApiResponse<PageResult<SysIntegrationMonitor>> page(IntegrationQuery query) {
        return ApiResponse.success(service.pageMonitors(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:integration:monitor:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:integration:monitor:list")
    public ApiResponse<SysIntegrationMonitor> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:integration:monitor:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysIntegrationMonitorSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:integration:monitor:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysIntegrationMonitorSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 重新汇总健康度。 */
    @PostMapping("/{id}/aggregate")
    @RequirePermission("platform:integration:monitor:manage")
    public ApiResponse<SysIntegrationMonitor> aggregate(@PathVariable Long id) {
        return ApiResponse.success(service.aggregate(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:integration:monitor:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
