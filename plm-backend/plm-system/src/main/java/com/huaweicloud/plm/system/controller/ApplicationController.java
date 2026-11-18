package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ApplicationGrantRequest;
import com.huaweicloud.plm.system.dto.ApplicationQuery;
import com.huaweicloud.plm.system.dto.ApplicationSaveRequest;
import com.huaweicloud.plm.system.entity.SysApplication;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ApplicationService;
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

import java.util.List;

@RestController
@RequestMapping("/oa/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    @RequirePermission("oa:application:list")
    public ApiResponse<PageResult<SysApplication>> page(ApplicationQuery query) {
        return ApiResponse.success(applicationService.page(query));
    }

    /** 查询应用已授权的角色 ID 集合，供授权弹窗回显。 */
    @GetMapping("/{applicationId}/roles")
    @RequirePermission("oa:application:list")
    public ApiResponse<List<Long>> grantedRoleIds(@PathVariable Long applicationId) {
        return ApiResponse.success(applicationService.listGrantedRoleIds(applicationId));
    }

    @PostMapping
    @RequirePermission("oa:application:save")
    public ApiResponse<Long> create(@Valid @RequestBody ApplicationSaveRequest request) {
        return ApiResponse.success(applicationService.create(request));
    }

    @PutMapping("/{applicationId}")
    @RequirePermission("oa:application:save")
    public ApiResponse<Void> update(@PathVariable Long applicationId,
                                    @Valid @RequestBody ApplicationSaveRequest request) {
        applicationService.update(applicationId, request);
        return ApiResponse.success();
    }

    /** 应用授权：以全量覆盖方式更新可见角色集合。 */
    @PutMapping("/{applicationId}/grant")
    @RequirePermission("oa:application:grant")
    public ApiResponse<Void> grant(@PathVariable Long applicationId,
                                   @RequestBody ApplicationGrantRequest request) {
        applicationService.grant(applicationId, request.getRoleIds());
        return ApiResponse.success();
    }

    @DeleteMapping("/{applicationId}")
    @RequirePermission("oa:application:delete")
    public ApiResponse<Void> delete(@PathVariable Long applicationId) {
        applicationService.delete(applicationId);
        return ApiResponse.success();
    }
}
