package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportIndicatorSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportIndicator;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysReportIndicatorService;
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
 * 指标口径接口（G1-N2 报表平台 WBS T010）：指标登记、发布与停用。
 */
@RestController
@RequestMapping("/platform/report/indicators")
@RequiredArgsConstructor
public class SysReportIndicatorController {

    private final SysReportIndicatorService service;

    @GetMapping
    @RequirePermission("platform:report:indicator:list")
    public ApiResponse<PageResult<SysReportIndicator>> page(ReportQuery query) {
        return ApiResponse.success(service.pageIndicators(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:report:indicator:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:report:indicator:list")
    public ApiResponse<SysReportIndicator> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:report:indicator:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysReportIndicatorSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:report:indicator:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysReportIndicatorSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 发布指标。 */
    @PostMapping("/{id}/publish")
    @RequirePermission("platform:report:indicator:manage")
    public ApiResponse<SysReportIndicator> publish(@PathVariable Long id) {
        return ApiResponse.success(service.publish(id));
    }

    /** 停用指标。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:report:indicator:manage")
    public ApiResponse<SysReportIndicator> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:report:indicator:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
