package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportExportLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportExportLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysReportExportLogService;
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
 * 导出审计接口（G1-N2 报表平台 WBS T010）：导出留痕登记与查询。
 */
@RestController
@RequestMapping("/platform/report/export-logs")
@RequiredArgsConstructor
public class SysReportExportLogController {

    private final SysReportExportLogService service;

    @GetMapping
    @RequirePermission("platform:report:exportlog:list")
    public ApiResponse<PageResult<SysReportExportLog>> page(ReportQuery query) {
        return ApiResponse.success(service.pageExportLogs(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:report:exportlog:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:report:exportlog:list")
    public ApiResponse<SysReportExportLog> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:report:exportlog:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysReportExportLogSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:report:exportlog:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysReportExportLogSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:report:exportlog:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
