package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DevopsEnvironmentQuery;
import com.huaweicloud.plm.system.dto.DevopsEnvironmentSaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsEnvironment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDevopsEnvironmentService;
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
 * 环境接口（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 环境登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/devops/environments")
@RequiredArgsConstructor
public class SysDevopsEnvironmentController {

    private final SysDevopsEnvironmentService service;

    @GetMapping
    @RequirePermission("platform:devops:environment:list")
    public ApiResponse<PageResult<SysDevopsEnvironment>> page(DevopsEnvironmentQuery query) {
        return ApiResponse.success(service.pageEnvironments(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:devops:environment:list")
    public ApiResponse<SysDevopsEnvironment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:devops:environment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody DevopsEnvironmentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:devops:environment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody DevopsEnvironmentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:devops:environment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
