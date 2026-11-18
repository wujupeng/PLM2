package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmErpReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgPlmErpReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmErpReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmErpReceiptService;
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
 * ERP 接收回执接口：ERP 对 PLM 发布对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-erp/receipts")
@RequiredArgsConstructor
public class IntgPlmErpReceiptController {

    private final IntgPlmErpReceiptService service;

    @GetMapping
    @RequirePermission("intg:plm-erp:receipt:list")
    public ApiResponse<PageResult<IntgPlmErpReceipt>> page(IntgPlmErpReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-erp:receipt:list")
    public ApiResponse<IntgPlmErpReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-erp:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmErpReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-erp:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmErpReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-erp:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
