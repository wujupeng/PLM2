package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigMasterDataReceiptQuery;
import com.huaweicloud.plm.system.dto.MigMasterDataReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.MigMasterDataReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigMasterDataReceiptService;
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
 * 主数据迁移接收回执接口：接收系统对主数据迁移推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/master-data/receipts")
@RequiredArgsConstructor
public class MigMasterDataReceiptController {

    private final MigMasterDataReceiptService service;

    @GetMapping
    @RequirePermission("mig:master-data:receipt:list")
    public ApiResponse<PageResult<MigMasterDataReceipt>> page(MigMasterDataReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:master-data:receipt:list")
    public ApiResponse<MigMasterDataReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:master-data:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigMasterDataReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:master-data:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigMasterDataReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:master-data:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
