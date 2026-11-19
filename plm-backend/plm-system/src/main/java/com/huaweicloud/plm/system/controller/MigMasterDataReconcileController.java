package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigMasterDataReconcileQuery;
import com.huaweicloud.plm.system.dto.MigMasterDataReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.MigMasterDataReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigMasterDataReconcileService;
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
 * 主数据迁移对账接口：主数据迁移集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/master-data/reconciles")
@RequiredArgsConstructor
public class MigMasterDataReconcileController {

    private final MigMasterDataReconcileService service;

    @GetMapping
    @RequirePermission("mig:master-data:reconcile:list")
    public ApiResponse<PageResult<MigMasterDataReconcile>> page(MigMasterDataReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:master-data:reconcile:list")
    public ApiResponse<MigMasterDataReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:master-data:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigMasterDataReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:master-data:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigMasterDataReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:master-data:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
