package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovArchComponentQuery;
import com.huaweicloud.plm.system.dto.SysGovArchComponentSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovArchComponent;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovArchComponentService;
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
 * 架构组件接口（G1-N7 公共平台底座—治理中心 WBS T005 总体架构）：
 * 架构组件登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/arch-components")
@RequiredArgsConstructor
public class SysGovArchComponentController {

    private final SysGovArchComponentService service;

    @GetMapping
    @RequirePermission("platform:gov:archcomponent:list")
    public ApiResponse<PageResult<SysGovArchComponent>> page(SysGovArchComponentQuery query) {
        return ApiResponse.success(service.pageArchComponents(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:archcomponent:list")
    public ApiResponse<SysGovArchComponent> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:archcomponent:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovArchComponentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:archcomponent:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovArchComponentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:archcomponent:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
