package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgQualityLoopReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgQualityLoopReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgQualityLoopReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgQualityLoopReceiptService;
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
 * 质量闭环接收回执接口：接收系统对质量闭环推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/quality-loop/receipts")
@RequiredArgsConstructor
public class IntgQualityLoopReceiptController {

    private final IntgQualityLoopReceiptService service;

    @GetMapping
    @RequirePermission("intg:quality-loop:receipt:list")
    public ApiResponse<PageResult<IntgQualityLoopReceipt>> page(IntgQualityLoopReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:quality-loop:receipt:list")
    public ApiResponse<IntgQualityLoopReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:quality-loop:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgQualityLoopReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:quality-loop:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgQualityLoopReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:quality-loop:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
