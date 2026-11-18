package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.OrgSaveRequest;
import com.huaweicloud.plm.system.dto.OrgTreeNode;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OrganizationService;
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
@RequestMapping("/system/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/tree")
    @RequirePermission("system:org:list")
    public ApiResponse<List<OrgTreeNode>> tree() {
        return ApiResponse.success(organizationService.tree());
    }

    @PostMapping
    @RequirePermission("system:org:create")
    public ApiResponse<Long> create(@Valid @RequestBody OrgSaveRequest request) {
        return ApiResponse.success(organizationService.create(request));
    }

    @PutMapping("/{orgId}")
    @RequirePermission("system:org:update")
    public ApiResponse<Void> update(@PathVariable Long orgId, @Valid @RequestBody OrgSaveRequest request) {
        organizationService.update(orgId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{orgId}")
    @RequirePermission("system:org:delete")
    public ApiResponse<Void> delete(@PathVariable Long orgId) {
        organizationService.delete(orgId);
        return ApiResponse.success();
    }
}
