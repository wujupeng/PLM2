package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigBomMappingQuery;
import com.huaweicloud.plm.system.dto.MigBomMappingSaveRequest;
import com.huaweicloud.plm.system.entity.MigBomMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigBomMappingService;
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
 * 字段映射接口：BOM迁移集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/bom/mappings")
@RequiredArgsConstructor
public class MigBomMappingController {

    private final MigBomMappingService service;

    @GetMapping
    @RequirePermission("mig:bom:mapping:list")
    public ApiResponse<PageResult<MigBomMapping>> page(MigBomMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:bom:mapping:list")
    public ApiResponse<MigBomMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:bom:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigBomMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:bom:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigBomMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:bom:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
