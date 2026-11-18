package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsReplenishOrderQuery;
import com.huaweicloud.plm.system.dto.WmsReplenishOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsReplenishOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsReplenishOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 生产补料单接口：补料登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/return/replenishes")
@RequiredArgsConstructor
public class WmsReplenishOrderController {

    private final WmsReplenishOrderService service;

    @GetMapping
    @RequirePermission("wms:return:replenish:list")
    public ApiResponse<PageResult<WmsReplenishOrder>> page(WmsReplenishOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:return:replenish:list")
    public ApiResponse<WmsReplenishOrder> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:return:replenish:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsReplenishOrderSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:return:replenish:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsReplenishOrderSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:return:replenish:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
