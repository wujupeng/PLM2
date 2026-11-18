package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportDefinitionSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportDefinition;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysReportDefinitionService;
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
 * 报表定义接口（G1-N2 报表平台 WBS T010）：报表登记、发布与停用。
 */
@RestController
@RequestMapping("/platform/report/definitions")
@RequiredArgsConstructor
public class SysReportDefinitionController {

    private final SysReportDefinitionService service;

    @GetMapping
    @RequirePermission("platform:report:definition:list")
    public ApiResponse<PageResult<SysReportDefinition>> page(ReportQuery query) {
        return ApiResponse.success(service.pageDefinitions(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:report:definition:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:report:definition:list")
    public ApiResponse<SysReportDefinition> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:report:definition:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysReportDefinitionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:report:definition:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysReportDefinitionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 发布报表。 */
    @PostMapping("/{id}/publish")
    @RequirePermission("platform:report:definition:manage")
    public ApiResponse<SysReportDefinition> publish(@PathVariable Long id) {
        return ApiResponse.success(service.publish(id));
    }

    /** 停用报表。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:report:definition:manage")
    public ApiResponse<SysReportDefinition> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:report:definition:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
