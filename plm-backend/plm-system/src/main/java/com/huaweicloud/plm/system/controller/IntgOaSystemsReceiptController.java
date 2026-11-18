package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgOaSystemsReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgOaSystemsReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgOaSystemsReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgOaSystemsReceiptService;
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
 * OA↔六系统接收回执接口：系统对 OA 推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/oa-systems/receipts")
@RequiredArgsConstructor
public class IntgOaSystemsReceiptController {

    private final IntgOaSystemsReceiptService service;

    @GetMapping
    @RequirePermission("intg:oa-systems:receipt:list")
    public ApiResponse<PageResult<IntgOaSystemsReceipt>> page(IntgOaSystemsReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:oa-systems:receipt:list")
    public ApiResponse<IntgOaSystemsReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:oa-systems:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgOaSystemsReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:oa-systems:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgOaSystemsReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:oa-systems:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
