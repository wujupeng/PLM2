package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgDocumentChainReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgDocumentChainReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgDocumentChainReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgDocumentChainReceiptService;
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
 * 单据全链路接收回执接口：接收系统对单据全链路推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/document-chain/receipts")
@RequiredArgsConstructor
public class IntgDocumentChainReceiptController {

    private final IntgDocumentChainReceiptService service;

    @GetMapping
    @RequirePermission("intg:document-chain:receipt:list")
    public ApiResponse<PageResult<IntgDocumentChainReceipt>> page(IntgDocumentChainReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:document-chain:receipt:list")
    public ApiResponse<IntgDocumentChainReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:document-chain:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgDocumentChainReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:document-chain:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgDocumentChainReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:document-chain:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
