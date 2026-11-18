package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsLineSideInventoryQuery;
import com.huaweicloud.plm.system.dto.WmsLineSideInventorySaveRequest;
import com.huaweicloud.plm.system.entity.WmsLineSideInventory;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsLineSideInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 线边仓库存接口：线边库存登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/pick/line-stocks")
@RequiredArgsConstructor
public class WmsLineSideInventoryController {

    private final WmsLineSideInventoryService service;

    @GetMapping
    @RequirePermission("wms:pick:linestock:list")
    public ApiResponse<PageResult<WmsLineSideInventory>> page(WmsLineSideInventoryQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:pick:linestock:list")
    public ApiResponse<WmsLineSideInventory> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:pick:linestock:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsLineSideInventorySaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:pick:linestock:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsLineSideInventorySaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:pick:linestock:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
