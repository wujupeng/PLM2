package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsWarehouseQuery;
import com.huaweicloud.plm.system.dto.WmsWarehouseSaveRequest;
import com.huaweicloud.plm.system.entity.WmsWarehouse;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsWarehouseService;
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
 * 仓库管理接口（对应仓库）：
 * 仓库登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/base/warehouses")
@RequiredArgsConstructor
public class WmsWarehouseController {

    private final WmsWarehouseService service;

    @GetMapping
    @RequirePermission("wms:base:warehouse:list")
    public ApiResponse<PageResult<WmsWarehouse>> page(WmsWarehouseQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:base:warehouse:list")
    public ApiResponse<WmsWarehouse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:base:warehouse:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsWarehouseSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:base:warehouse:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsWarehouseSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:base:warehouse:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
