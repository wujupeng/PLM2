package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsTransferOrderQuery;
import com.huaweicloud.plm.system.dto.WmsTransferOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsTransferOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsTransferOrderService;
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
 * 调拨单接口：调拨单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/stocktake/transfers")
@RequiredArgsConstructor
public class WmsTransferOrderController {

    private final WmsTransferOrderService service;

    @GetMapping
    @RequirePermission("wms:stocktake:transfer:list")
    public ApiResponse<PageResult<WmsTransferOrder>> page(WmsTransferOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:stocktake:transfer:list")
    public ApiResponse<WmsTransferOrder> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:stocktake:transfer:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsTransferOrderSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:stocktake:transfer:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsTransferOrderSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:stocktake:transfer:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
