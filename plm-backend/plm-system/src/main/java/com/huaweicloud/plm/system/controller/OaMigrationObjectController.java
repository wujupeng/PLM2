package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizMigrationFieldMappingSaveRequest;
import com.huaweicloud.plm.system.dto.BizMigrationObjectSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationFieldMapping;
import com.huaweicloud.plm.system.entity.OaMigrationObject;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMigrationObjectService;
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
import java.util.Map;

/**
 * 迁移对象目录与字段映射接口（OA-DEV-095/096）：迁移范围、源位置、目标对象与字段转换规则。
 */
@RestController
@RequestMapping("/oa/migration/objects")
@RequiredArgsConstructor
public class OaMigrationObjectController {

    private final OaMigrationObjectService objectService;

    // ================= 迁移对象目录 =================

    @GetMapping
    @RequirePermission("oa:migration:object:list")
    public ApiResponse<PageResult<OaMigrationObject>> page(OaMigrationQuery query) {
        return ApiResponse.success(objectService.pageObjects(query));
    }

    @GetMapping("/all")
    @RequirePermission("oa:migration:object:list")
    public ApiResponse<List<OaMigrationObject>> listAll() {
        return ApiResponse.success(objectService.listAllObjects());
    }

    @GetMapping("/overview")
    @RequirePermission("oa:migration:object:list")
    public ApiResponse<Map<String, Object>> overview() {
        return ApiResponse.success(objectService.overview());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:migration:object:list")
    public ApiResponse<OaMigrationObject> detail(@PathVariable Long id) {
        return ApiResponse.success(objectService.detailObject(id));
    }

    @PostMapping
    @RequirePermission("oa:migration:object:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizMigrationObjectSaveRequest request) {
        return ApiResponse.success(objectService.saveObject(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:migration:object:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody BizMigrationObjectSaveRequest request) {
        return ApiResponse.success(objectService.saveObject(id, request));
    }

    /** 标记对象迁移完成并回写已迁移数量。 */
    @PostMapping("/{id}/mark-migrated")
    @RequirePermission("oa:migration:object:manage")
    public ApiResponse<OaMigrationObject> markMigrated(@PathVariable Long id,
                                                       @RequestParam(required = false) Long migratedCount,
                                                       @RequestParam(required = false) String status) {
        return ApiResponse.success(objectService.markObjectMigrated(id, migratedCount, status));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:migration:object:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        objectService.deleteObject(id);
        return ApiResponse.success();
    }

    // ================= 字段映射字典 =================

    @GetMapping("/field-mappings")
    @RequirePermission("oa:migration:object:list")
    public ApiResponse<PageResult<OaMigrationFieldMapping>> pageMappings(OaMigrationQuery query) {
        return ApiResponse.success(objectService.pageMappings(query));
    }

    @GetMapping("/field-mappings/{id}")
    @RequirePermission("oa:migration:object:list")
    public ApiResponse<OaMigrationFieldMapping> mappingDetail(@PathVariable Long id) {
        return ApiResponse.success(objectService.detailMapping(id));
    }

    @PostMapping("/field-mappings")
    @RequirePermission("oa:migration:object:manage")
    public ApiResponse<Long> createMapping(@Valid @RequestBody BizMigrationFieldMappingSaveRequest request) {
        return ApiResponse.success(objectService.saveMapping(null, request));
    }

    @PutMapping("/field-mappings/{id}")
    @RequirePermission("oa:migration:object:manage")
    public ApiResponse<Long> updateMapping(@PathVariable Long id,
                                          @Valid @RequestBody BizMigrationFieldMappingSaveRequest request) {
        return ApiResponse.success(objectService.saveMapping(id, request));
    }

    @DeleteMapping("/field-mappings/{id}")
    @RequirePermission("oa:migration:object:manage")
    public ApiResponse<Void> deleteMapping(@PathVariable Long id) {
        objectService.deleteMapping(id);
        return ApiResponse.success();
    }
}
