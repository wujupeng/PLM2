package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsStocktakeOrderQuery;
import com.huaweicloud.plm.system.dto.WmsStocktakeOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsStocktakeOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsStocktakeOrderService;
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
 * 盘点单接口：盘点任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/stocktake/orders")
@RequiredArgsConstructor
public class WmsStocktakeOrderController {

    private final WmsStocktakeOrderService service;

    @GetMapping
    @RequirePermission("wms:stocktake:order:list")
    public ApiResponse<PageResult<WmsStocktakeOrder>> page(WmsStocktakeOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:stocktake:order:list")
    public ApiResponse<WmsStocktakeOrder> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:stocktake:order:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsStocktakeOrderSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:stocktake:order:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsStocktakeOrderSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:stocktake:order:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
