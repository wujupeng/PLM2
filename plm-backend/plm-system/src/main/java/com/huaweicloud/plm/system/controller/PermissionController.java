package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.PermissionTreeNode;
import com.huaweicloud.plm.system.entity.SysPermission;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/system/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/tree")
    @RequirePermission("system:role:list")
    public ApiResponse<List<PermissionTreeNode>> tree() {
        return ApiResponse.success(permissionService.tree());
    }

    @GetMapping
    @RequirePermission("system:role:list")
    public ApiResponse<List<SysPermission>> list() {
        return ApiResponse.success(permissionService.listAll());
    }
}
