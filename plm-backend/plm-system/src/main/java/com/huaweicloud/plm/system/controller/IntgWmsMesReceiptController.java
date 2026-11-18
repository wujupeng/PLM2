package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgWmsMesReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgWmsMesReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgWmsMesReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgWmsMesReceiptService;
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
 * WMS↔MES 接收回执接口：MES 对 WMS 推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/wms-mes/receipts")
@RequiredArgsConstructor
public class IntgWmsMesReceiptController {

    private final IntgWmsMesReceiptService service;

    @GetMapping
    @RequirePermission("intg:wms-mes:receipt:list")
    public ApiResponse<PageResult<IntgWmsMesReceipt>> page(IntgWmsMesReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:wms-mes:receipt:list")
    public ApiResponse<IntgWmsMesReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:wms-mes:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgWmsMesReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:wms-mes:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgWmsMesReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:wms-mes:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
