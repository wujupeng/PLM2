package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsReturnOrderQuery;
import com.huaweicloud.plm.system.dto.WmsReturnOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsReturnOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsReturnOrderService;
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
 * 生产退料单接口：退料登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/return/returns")
@RequiredArgsConstructor
public class WmsReturnOrderController {

    private final WmsReturnOrderService service;

    @GetMapping
    @RequirePermission("wms:return:return:list")
    public ApiResponse<PageResult<WmsReturnOrder>> page(WmsReturnOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:return:return:list")
    public ApiResponse<WmsReturnOrder> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:return:return:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsReturnOrderSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:return:return:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsReturnOrderSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:return:return:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
