package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpSrmReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgErpSrmReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpSrmReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpSrmReceiptService;
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
@RequestMapping("/intg/erp-srm/receipts")
@RequiredArgsConstructor
public class IntgErpSrmReceiptController {

    private final IntgErpSrmReceiptService service;

    @GetMapping
    @RequirePermission("intg:erp-srm:receipt:list")
    public ApiResponse<PageResult<IntgErpSrmReceipt>> page(IntgErpSrmReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-srm:receipt:list")
    public ApiResponse<IntgErpSrmReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-srm:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpSrmReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-srm:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpSrmReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-srm:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
