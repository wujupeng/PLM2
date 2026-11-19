package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigInventoryReceiptQuery;
import com.huaweicloud.plm.system.dto.MigInventoryReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.MigInventoryReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigInventoryReceiptService;
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
 * 库存迁移接收回执接口：接收系统对库存迁移推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/inventory/receipts")
@RequiredArgsConstructor
public class MigInventoryReceiptController {

    private final MigInventoryReceiptService service;

    @GetMapping
    @RequirePermission("mig:inventory:receipt:list")
    public ApiResponse<PageResult<MigInventoryReceipt>> page(MigInventoryReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:inventory:receipt:list")
    public ApiResponse<MigInventoryReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:inventory:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigInventoryReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:inventory:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigInventoryReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:inventory:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
