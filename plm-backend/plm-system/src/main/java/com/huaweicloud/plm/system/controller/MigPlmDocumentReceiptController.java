package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigPlmDocumentReceiptQuery;
import com.huaweicloud.plm.system.dto.MigPlmDocumentReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.MigPlmDocumentReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigPlmDocumentReceiptService;
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
 * PLM文档迁移接收回执接口：接收系统对PLM文档迁移推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/plm-document/receipts")
@RequiredArgsConstructor
public class MigPlmDocumentReceiptController {

    private final MigPlmDocumentReceiptService service;

    @GetMapping
    @RequirePermission("mig:plm-document:receipt:list")
    public ApiResponse<PageResult<MigPlmDocumentReceipt>> page(MigPlmDocumentReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:plm-document:receipt:list")
    public ApiResponse<MigPlmDocumentReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:plm-document:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigPlmDocumentReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:plm-document:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigPlmDocumentReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:plm-document:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
