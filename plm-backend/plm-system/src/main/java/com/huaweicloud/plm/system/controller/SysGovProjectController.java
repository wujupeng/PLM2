package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovProjectQuery;
import com.huaweicloud.plm.system.dto.SysGovProjectSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovProject;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovProjectService;
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
 * 治理项目接口（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 项目登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/projects")
@RequiredArgsConstructor
public class SysGovProjectController {

    private final SysGovProjectService service;

    @GetMapping
    @RequirePermission("platform:gov:project:list")
    public ApiResponse<PageResult<SysGovProject>> page(SysGovProjectQuery query) {
        return ApiResponse.success(service.pageProjects(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:project:list")
    public ApiResponse<SysGovProject> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:project:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovProjectSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:project:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovProjectSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:project:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
