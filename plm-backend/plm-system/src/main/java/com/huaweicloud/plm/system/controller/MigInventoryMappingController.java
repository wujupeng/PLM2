package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigInventoryMappingQuery;
import com.huaweicloud.plm.system.dto.MigInventoryMappingSaveRequest;
import com.huaweicloud.plm.system.entity.MigInventoryMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigInventoryMappingService;
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
 * 字段映射接口：库存迁移集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/inventory/mappings")
@RequiredArgsConstructor
public class MigInventoryMappingController {

    private final MigInventoryMappingService service;

    @GetMapping
    @RequirePermission("mig:inventory:mapping:list")
    public ApiResponse<PageResult<MigInventoryMapping>> page(MigInventoryMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:inventory:mapping:list")
    public ApiResponse<MigInventoryMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:inventory:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigInventoryMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:inventory:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigInventoryMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:inventory:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
