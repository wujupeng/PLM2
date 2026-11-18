package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.DocFolderItem;
import com.huaweicloud.plm.system.dto.DocFolderPermissionItem;
import com.huaweicloud.plm.system.dto.DocFolderPermissionSaveRequest;
import com.huaweicloud.plm.system.dto.DocFolderSaveRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DocFolderPermissionService;
import com.huaweicloud.plm.system.service.DocFolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 文档目录与目录权限接口（OA-DEV-046）：公共/部门/项目/个人/共享/流程归档/知识库目录的
 * 树形浏览、增删改查，以及「目录 + 授权对象 + 权限级别」的权限映射维护。
 */
@RestController
@RequestMapping("/oa/doc-folders")
@RequiredArgsConstructor
public class OaDocFolderController {

    private final DocFolderService folderService;
    private final DocFolderPermissionService folderPermissionService;

    /** 目录树：仅返回当前用户可读的目录。 */
    @GetMapping("/tree")
    @RequirePermission("oa:doc:list")
    public ApiResponse<List<DocFolderItem>> tree(@RequestParam(required = false) String folderType) {
        return ApiResponse.success(folderService.tree(folderType));
    }

    /** 直接子目录列表。 */
    @GetMapping
    @RequirePermission("oa:doc:list")
    public ApiResponse<List<DocFolderItem>> list(@RequestParam(required = false) Long parentId,
                                                 @RequestParam(required = false) String folderType) {
        return ApiResponse.success(folderService.list(parentId, folderType));
    }

    @GetMapping("/{folderId}")
    @RequirePermission("oa:doc:list")
    public ApiResponse<DocFolderItem> detail(@PathVariable Long folderId) {
        return ApiResponse.success(folderService.detail(folderId));
    }

    @PostMapping
    @RequirePermission("oa:doc:folder")
    public ApiResponse<Long> create(@Valid @RequestBody DocFolderSaveRequest request) {
        return ApiResponse.success(folderService.create(request));
    }

    @PutMapping("/{folderId}")
    @RequirePermission("oa:doc:folder")
    public ApiResponse<Void> update(@PathVariable Long folderId, @Valid @RequestBody DocFolderSaveRequest request) {
        folderService.update(folderId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{folderId}")
    @RequirePermission("oa:doc:folder")
    public ApiResponse<Void> delete(@PathVariable Long folderId) {
        folderService.delete(folderId);
        return ApiResponse.success();
    }

    @GetMapping("/{folderId}/permissions")
    @RequirePermission("oa:doc:list")
    public ApiResponse<List<DocFolderPermissionItem>> listPermissions(@PathVariable Long folderId) {
        return ApiResponse.success(folderPermissionService.list(folderId));
    }

    @PostMapping("/{folderId}/permissions")
    @RequirePermission("oa:doc:folder")
    public ApiResponse<Long> createPermission(@PathVariable Long folderId,
                                              @Valid @RequestBody DocFolderPermissionSaveRequest request) {
        return ApiResponse.success(folderPermissionService.create(folderId, request));
    }

    @PutMapping("/permissions/{permissionId}")
    @RequirePermission("oa:doc:folder")
    public ApiResponse<Void> updatePermission(@PathVariable Long permissionId,
                                              @Valid @RequestBody DocFolderPermissionSaveRequest request) {
        folderPermissionService.update(permissionId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/permissions/{permissionId}")
    @RequirePermission("oa:doc:folder")
    public ApiResponse<Void> deletePermission(@PathVariable Long permissionId) {
        folderPermissionService.delete(permissionId);
        return ApiResponse.success();
    }
}
