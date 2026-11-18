package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmEightDReportQuery;
import com.huaweicloud.plm.system.dto.SrmEightDReportSaveRequest;
import com.huaweicloud.plm.system.entity.SrmEightDReport;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmEightDReportService;
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
 * 8D 报告接口（对应 8D 报告）：
 * 报告登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/eightd")
@RequiredArgsConstructor
public class SrmEightDReportController {

    private final SrmEightDReportService service;

    @GetMapping
    @RequirePermission("srm:quality:eightd:list")
    public ApiResponse<PageResult<SrmEightDReport>> page(SrmEightDReportQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:quality:eightd:list")
    public ApiResponse<SrmEightDReport> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:quality:eightd:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmEightDReportSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:quality:eightd:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmEightDReportSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:quality:eightd:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
