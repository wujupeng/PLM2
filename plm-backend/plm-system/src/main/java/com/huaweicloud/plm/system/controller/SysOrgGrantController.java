package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysOrgGrantSaveRequest;
import com.huaweicloud.plm.system.entity.SysOrgGrant;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysOrgGrantService;
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
 * 跨组织授权接口（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 授权关系登记、撤销/过期状态流转。
 */
@RestController
@RequestMapping("/platform/org/org-grants")
@RequiredArgsConstructor
public class SysOrgGrantController {

    private final SysOrgGrantService service;

    @GetMapping
    @RequirePermission("platform:org:orggrant:list")
    public ApiResponse<PageResult<SysOrgGrant>> page(OrgQuery query) {
        return ApiResponse.success(service.pageOrgGrants(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:org:orggrant:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:org:orggrant:list")
    public ApiResponse<SysOrgGrant> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:org:orggrant:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysOrgGrantSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:org:orggrant:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysOrgGrantSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 撤销。 */
    @PostMapping("/{id}/revoke")
    @RequirePermission("platform:org:orggrant:manage")
    public ApiResponse<SysOrgGrant> revoke(@PathVariable Long id) {
        return ApiResponse.success(service.revoke(id));
    }

    /** 过期。 */
    @PostMapping("/{id}/expire")
    @RequirePermission("platform:org:orggrant:manage")
    public ApiResponse<SysOrgGrant> expire(@PathVariable Long id) {
        return ApiResponse.success(service.expire(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:org:orggrant:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
