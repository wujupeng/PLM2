package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovAsisFindingQuery;
import com.huaweicloud.plm.system.dto.SysGovAsisFindingSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovAsisFinding;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovAsisFindingService;
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
 * 盘点发现接口（G1-N7 治理中心 T002 现状盘点）：发现登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/asis-findings")
@RequiredArgsConstructor
public class SysGovAsisFindingController {

    private final SysGovAsisFindingService service;

    @GetMapping
    @RequirePermission("platform:gov:asisfinding:list")
    public ApiResponse<PageResult<SysGovAsisFinding>> page(SysGovAsisFindingQuery query) {
        return ApiResponse.success(service.pageFindings(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:asisfinding:list")
    public ApiResponse<SysGovAsisFinding> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:asisfinding:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovAsisFindingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:asisfinding:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovAsisFindingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:asisfinding:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
