package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DocStateLogQuery;
import com.huaweicloud.plm.system.dto.SysDocStateLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysDocStateLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDocStateLogService;
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
 * 单据状态流转日志接口（G1-N6 公共平台底座—通用能力 WBS T102 单据状态机）：
 * 状态变更轨迹记录、查询与统计。
 */
@RestController
@RequestMapping("/platform/doc-state/state-logs")
@RequiredArgsConstructor
public class SysDocStateLogController {

    private final SysDocStateLogService service;

    @GetMapping
    @RequirePermission("platform:docstate:statelog:list")
    public ApiResponse<PageResult<SysDocStateLog>> page(DocStateLogQuery query) {
        return ApiResponse.success(service.pageLogs(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:docstate:statelog:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:docstate:statelog:list")
    public ApiResponse<SysDocStateLog> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:docstate:statelog:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysDocStateLogSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:docstate:statelog:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysDocStateLogSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:docstate:statelog:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
