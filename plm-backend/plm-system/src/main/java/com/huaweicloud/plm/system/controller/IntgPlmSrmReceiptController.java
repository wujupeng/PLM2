package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmSrmReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgPlmSrmReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmSrmReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmSrmReceiptService;
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
 * SRM 接收回执接口：SRM 对 PLM 发布对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-srm/receipts")
@RequiredArgsConstructor
public class IntgPlmSrmReceiptController {

    private final IntgPlmSrmReceiptService service;

    @GetMapping
    @RequirePermission("intg:plm-srm:receipt:list")
    public ApiResponse<PageResult<IntgPlmSrmReceipt>> page(IntgPlmSrmReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-srm:receipt:list")
    public ApiResponse<IntgPlmSrmReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-srm:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmSrmReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-srm:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmSrmReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-srm:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
