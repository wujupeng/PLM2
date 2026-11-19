package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigInventoryBatchQuery;
import com.huaweicloud.plm.system.dto.MigInventoryBatchSaveRequest;
import com.huaweicloud.plm.system.entity.MigInventoryBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigInventoryBatchService;
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
 * 同步批次接口：库存迁移集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/inventory/batches")
@RequiredArgsConstructor
public class MigInventoryBatchController {

    private final MigInventoryBatchService service;

    @GetMapping
    @RequirePermission("mig:inventory:batch:list")
    public ApiResponse<PageResult<MigInventoryBatch>> page(MigInventoryBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:inventory:batch:list")
    public ApiResponse<MigInventoryBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:inventory:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigInventoryBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:inventory:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigInventoryBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:inventory:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
