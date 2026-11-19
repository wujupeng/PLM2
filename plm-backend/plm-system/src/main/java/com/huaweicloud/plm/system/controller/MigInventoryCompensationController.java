package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigInventoryCompensationQuery;
import com.huaweicloud.plm.system.dto.MigInventoryCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.MigInventoryCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigInventoryCompensationService;
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
 * 库存迁移异常补偿接口：库存迁移集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/inventory/compensations")
@RequiredArgsConstructor
public class MigInventoryCompensationController {

    private final MigInventoryCompensationService service;

    @GetMapping
    @RequirePermission("mig:inventory:compensation:list")
    public ApiResponse<PageResult<MigInventoryCompensation>> page(MigInventoryCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:inventory:compensation:list")
    public ApiResponse<MigInventoryCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:inventory:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigInventoryCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:inventory:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigInventoryCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:inventory:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
