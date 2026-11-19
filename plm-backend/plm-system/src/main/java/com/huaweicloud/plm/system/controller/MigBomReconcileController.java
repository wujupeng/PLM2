package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigBomReconcileQuery;
import com.huaweicloud.plm.system.dto.MigBomReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.MigBomReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigBomReconcileService;
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
 * BOM迁移对账接口：BOM迁移集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/bom/reconciles")
@RequiredArgsConstructor
public class MigBomReconcileController {

    private final MigBomReconcileService service;

    @GetMapping
    @RequirePermission("mig:bom:reconcile:list")
    public ApiResponse<PageResult<MigBomReconcile>> page(MigBomReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:bom:reconcile:list")
    public ApiResponse<MigBomReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:bom:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigBomReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:bom:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigBomReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:bom:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
