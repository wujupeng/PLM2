package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgLabelTraceReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgLabelTraceReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgLabelTraceReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgLabelTraceReceiptService;
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
 * 标签追溯接收回执接口：接收系统对标签追溯推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/label-trace/receipts")
@RequiredArgsConstructor
public class IntgLabelTraceReceiptController {

    private final IntgLabelTraceReceiptService service;

    @GetMapping
    @RequirePermission("intg:label-trace:receipt:list")
    public ApiResponse<PageResult<IntgLabelTraceReceipt>> page(IntgLabelTraceReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:label-trace:receipt:list")
    public ApiResponse<IntgLabelTraceReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:label-trace:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgLabelTraceReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:label-trace:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgLabelTraceReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:label-trace:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
