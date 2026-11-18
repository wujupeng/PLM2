package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportDatasetSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportDataset;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysReportDatasetService;
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
 * 数据集市接口（G1-N2 报表平台 WBS T010）：数据集登记、刷新与停用。
 */
@RestController
@RequestMapping("/platform/report/datasets")
@RequiredArgsConstructor
public class SysReportDatasetController {

    private final SysReportDatasetService service;

    @GetMapping
    @RequirePermission("platform:report:dataset:list")
    public ApiResponse<PageResult<SysReportDataset>> page(ReportQuery query) {
        return ApiResponse.success(service.pageDatasets(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:report:dataset:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:report:dataset:list")
    public ApiResponse<SysReportDataset> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:report:dataset:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysReportDatasetSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:report:dataset:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysReportDatasetSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 刷新数据集：回填刷新时间，草稿状态刷新后自动激活。 */
    @PostMapping("/{id}/refresh")
    @RequirePermission("platform:report:dataset:manage")
    public ApiResponse<SysReportDataset> refresh(@PathVariable Long id) {
        return ApiResponse.success(service.refresh(id));
    }

    /** 停用数据集。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:report:dataset:manage")
    public ApiResponse<SysReportDataset> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:report:dataset:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
