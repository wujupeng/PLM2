package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovAsisSystemQuery;
import com.huaweicloud.plm.system.dto.SysGovAsisSystemSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovAsisSystem;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovAsisSystemService;
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
 * 存量系统接口（G1-N7 治理中心 T002 现状盘点）：系统现状登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/asis-systems")
@RequiredArgsConstructor
public class SysGovAsisSystemController {

    private final SysGovAsisSystemService service;

    @GetMapping
    @RequirePermission("platform:gov:asissystem:list")
    public ApiResponse<PageResult<SysGovAsisSystem>> page(SysGovAsisSystemQuery query) {
        return ApiResponse.success(service.pageSystems(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:asissystem:list")
    public ApiResponse<SysGovAsisSystem> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:asissystem:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovAsisSystemSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:asissystem:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovAsisSystemSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:asissystem:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
