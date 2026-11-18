package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.RoleQuery;
import com.huaweicloud.plm.system.dto.RoleResponse;
import com.huaweicloud.plm.system.dto.RoleSaveRequest;
import com.huaweicloud.plm.system.entity.SysRole;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.RoleService;
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
import java.util.Map;

@RestController
@RequestMapping("/system/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @RequirePermission("system:role:list")
    public ApiResponse<PageResult<RoleResponse>> page(RoleQuery query) {
        return ApiResponse.success(roleService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("system:role:list")
    public ApiResponse<List<SysRole>> options() {
        return ApiResponse.success(roleService.listAll());
    }

    @PostMapping
    @RequirePermission("system:role:create")
    public ApiResponse<Long> create(@Valid @RequestBody RoleSaveRequest request) {
        return ApiResponse.success(roleService.create(request));
    }

    @PutMapping("/{roleId}")
    @RequirePermission("system:role:update")
    public ApiResponse<Void> update(@PathVariable Long roleId, @Valid @RequestBody RoleSaveRequest request) {
        roleService.update(roleId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{roleId}")
    @RequirePermission("system:role:delete")
    public ApiResponse<Void> delete(@PathVariable Long roleId) {
        roleService.delete(roleId);
        return ApiResponse.success();
    }

    @GetMapping("/{roleId}/permissions")
    @RequirePermission("system:role:list")
    public ApiResponse<List<Long>> permissions(@PathVariable Long roleId) {
        return ApiResponse.success(roleService.listPermissionIds(roleId));
    }

    @PutMapping("/{roleId}/permissions")
    @RequirePermission("system:role:assign")
    public ApiResponse<Void> assignPermissions(@PathVariable Long roleId,
                                               @RequestBody Map<String, List<Long>> body) {
        roleService.assignPermissions(roleId, body.get("permissionIds"));
        return ApiResponse.success();
    }
}
