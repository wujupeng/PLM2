package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsInventoryBatchQuery;
import com.huaweicloud.plm.system.dto.WmsInventoryBatchSaveRequest;
import com.huaweicloud.plm.system.entity.WmsInventoryBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsInventoryBatchService;
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
 * 库存批次接口（对应库存批次）：
 * 库存批次登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/inventory/batches")
@RequiredArgsConstructor
public class WmsInventoryBatchController {

    private final WmsInventoryBatchService service;

    @GetMapping
    @RequirePermission("wms:inventory:batch:list")
    public ApiResponse<PageResult<WmsInventoryBatch>> page(WmsInventoryBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:inventory:batch:list")
    public ApiResponse<WmsInventoryBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:inventory:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsInventoryBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:inventory:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsInventoryBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:inventory:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
