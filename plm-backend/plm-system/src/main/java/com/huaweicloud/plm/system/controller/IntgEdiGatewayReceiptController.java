package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgEdiGatewayReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgEdiGatewayReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgEdiGatewayReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgEdiGatewayReceiptService;
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
 * EDI 网关接收回执接口：EDI 网关对入站报文的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/edi-gateway/receipts")
@RequiredArgsConstructor
public class IntgEdiGatewayReceiptController {

    private final IntgEdiGatewayReceiptService service;

    @GetMapping
    @RequirePermission("intg:edi-gateway:receipt:list")
    public ApiResponse<PageResult<IntgEdiGatewayReceipt>> page(IntgEdiGatewayReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:edi-gateway:receipt:list")
    public ApiResponse<IntgEdiGatewayReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:edi-gateway:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgEdiGatewayReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:edi-gateway:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgEdiGatewayReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:edi-gateway:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
