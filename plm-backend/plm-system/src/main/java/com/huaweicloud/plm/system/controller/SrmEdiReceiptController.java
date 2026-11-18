package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmEdiReceiptQuery;
import com.huaweicloud.plm.system.dto.SrmEdiReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.SrmEdiReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmEdiReceiptService;
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
 * EDI 回执接口（对应 EDI 回执）：
 * 回执登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/edi/receipts")
@RequiredArgsConstructor
public class SrmEdiReceiptController {

    private final SrmEdiReceiptService service;

    @GetMapping
    @RequirePermission("srm:edi:receipt:list")
    public ApiResponse<PageResult<SrmEdiReceipt>> page(SrmEdiReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:edi:receipt:list")
    public ApiResponse<SrmEdiReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:edi:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmEdiReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:edi:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmEdiReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:edi:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
