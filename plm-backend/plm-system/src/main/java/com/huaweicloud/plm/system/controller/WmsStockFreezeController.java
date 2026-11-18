package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsStockFreezeQuery;
import com.huaweicloud.plm.system.dto.WmsStockFreezeSaveRequest;
import com.huaweicloud.plm.system.entity.WmsStockFreeze;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsStockFreezeService;
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
 * 库存冻结接口（对应库存冻结）：
 * 库存冻结登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/inventory/freezes")
@RequiredArgsConstructor
public class WmsStockFreezeController {

    private final WmsStockFreezeService service;

    @GetMapping
    @RequirePermission("wms:inventory:freeze:list")
    public ApiResponse<PageResult<WmsStockFreeze>> page(WmsStockFreezeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:inventory:freeze:list")
    public ApiResponse<WmsStockFreeze> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:inventory:freeze:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsStockFreezeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:inventory:freeze:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsStockFreezeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:inventory:freeze:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
