package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpWmsReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgErpWmsReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpWmsReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpWmsReceiptService;
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
 * ERP↔WMS 接收回执接口：WMS 对 ERP 推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/erp-wms/receipts")
@RequiredArgsConstructor
public class IntgErpWmsReceiptController {

    private final IntgErpWmsReceiptService service;

    @GetMapping
    @RequirePermission("intg:erp-wms:receipt:list")
    public ApiResponse<PageResult<IntgErpWmsReceipt>> page(IntgErpWmsReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-wms:receipt:list")
    public ApiResponse<IntgErpWmsReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-wms:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpWmsReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-wms:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpWmsReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-wms:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
