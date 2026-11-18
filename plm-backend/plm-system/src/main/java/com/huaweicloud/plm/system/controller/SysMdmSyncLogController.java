package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysMdmSyncLogQuery;
import com.huaweicloud.plm.system.dto.SysMdmSyncLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmSyncLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMdmSyncLogService;
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
 * 主数据同步日志接口（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 同步日志登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/mdm/sync-logs")
@RequiredArgsConstructor
public class SysMdmSyncLogController {

    private final SysMdmSyncLogService service;

    @GetMapping
    @RequirePermission("platform:mdm:synclog:list")
    public ApiResponse<PageResult<SysMdmSyncLog>> page(SysMdmSyncLogQuery query) {
        return ApiResponse.success(service.pageSyncLogs(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mdm:synclog:list")
    public ApiResponse<SysMdmSyncLog> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mdm:synclog:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMdmSyncLogSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mdm:synclog:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMdmSyncLogSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mdm:synclog:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
