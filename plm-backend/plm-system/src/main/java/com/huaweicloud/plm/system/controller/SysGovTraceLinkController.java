package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovTraceLinkQuery;
import com.huaweicloud.plm.system.dto.SysGovTraceLinkSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovTraceLink;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovTraceLinkService;
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
 * 追踪链接接口（G1-N7 公共平台底座—治理中心 WBS T004 需求追踪）：
 * 追踪链接登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/trace-links")
@RequiredArgsConstructor
public class SysGovTraceLinkController {

    private final SysGovTraceLinkService service;

    @GetMapping
    @RequirePermission("platform:gov:tracelink:list")
    public ApiResponse<PageResult<SysGovTraceLink>> page(SysGovTraceLinkQuery query) {
        return ApiResponse.success(service.pageTraceLinks(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:tracelink:list")
    public ApiResponse<SysGovTraceLink> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:tracelink:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovTraceLinkSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:tracelink:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovTraceLinkSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:tracelink:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
