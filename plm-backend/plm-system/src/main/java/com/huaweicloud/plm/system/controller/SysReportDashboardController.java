package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportDashboardSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportDashboard;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysReportDashboardService;
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
 * 经营驾驶舱接口（G1-N2 报表平台 WBS T010）：看板登记、发布与停用。
 */
@RestController
@RequestMapping("/platform/report/dashboards")
@RequiredArgsConstructor
public class SysReportDashboardController {

    private final SysReportDashboardService service;

    @GetMapping
    @RequirePermission("platform:report:dashboard:list")
    public ApiResponse<PageResult<SysReportDashboard>> page(ReportQuery query) {
        return ApiResponse.success(service.pageDashboards(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:report:dashboard:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:report:dashboard:list")
    public ApiResponse<SysReportDashboard> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:report:dashboard:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysReportDashboardSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:report:dashboard:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysReportDashboardSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 发布驾驶舱。 */
    @PostMapping("/{id}/publish")
    @RequirePermission("platform:report:dashboard:manage")
    public ApiResponse<SysReportDashboard> publish(@PathVariable Long id) {
        return ApiResponse.success(service.publish(id));
    }

    /** 停用驾驶舱。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:report:dashboard:manage")
    public ApiResponse<SysReportDashboard> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:report:dashboard:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
