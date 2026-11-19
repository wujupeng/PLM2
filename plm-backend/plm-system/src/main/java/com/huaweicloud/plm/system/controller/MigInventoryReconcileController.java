package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigInventoryReconcileQuery;
import com.huaweicloud.plm.system.dto.MigInventoryReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.MigInventoryReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigInventoryReconcileService;
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
 * 库存迁移对账接口：库存迁移集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/inventory/reconciles")
@RequiredArgsConstructor
public class MigInventoryReconcileController {

    private final MigInventoryReconcileService service;

    @GetMapping
    @RequirePermission("mig:inventory:reconcile:list")
    public ApiResponse<PageResult<MigInventoryReconcile>> page(MigInventoryReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:inventory:reconcile:list")
    public ApiResponse<MigInventoryReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:inventory:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigInventoryReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:inventory:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigInventoryReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:inventory:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
