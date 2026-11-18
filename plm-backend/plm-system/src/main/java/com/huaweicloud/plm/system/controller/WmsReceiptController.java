package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsReceiptQuery;
import com.huaweicloud.plm.system.dto.WmsReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.WmsReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsReceiptService;
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
 * 收货单接口（对应收货单）：
 * 收货单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/inbound/receipts")
@RequiredArgsConstructor
public class WmsReceiptController {

    private final WmsReceiptService service;

    @GetMapping
    @RequirePermission("wms:inbound:receipt:list")
    public ApiResponse<PageResult<WmsReceipt>> page(WmsReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:inbound:receipt:list")
    public ApiResponse<WmsReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:inbound:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:inbound:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:inbound:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
