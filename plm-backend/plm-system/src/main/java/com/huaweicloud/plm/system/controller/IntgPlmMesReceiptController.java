package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmMesReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgPlmMesReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmMesReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmMesReceiptService;
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
 * MES 接收回执接口：MES 对 PLM 发布对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-mes/receipts")
@RequiredArgsConstructor
public class IntgPlmMesReceiptController {

    private final IntgPlmMesReceiptService service;

    @GetMapping
    @RequirePermission("intg:plm-mes:receipt:list")
    public ApiResponse<PageResult<IntgPlmMesReceipt>> page(IntgPlmMesReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-mes:receipt:list")
    public ApiResponse<IntgPlmMesReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-mes:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmMesReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-mes:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmMesReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-mes:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
