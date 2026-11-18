package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpOutsourceReceiptDetailResponse;
import com.huaweicloud.plm.system.dto.ErpOutsourceReceiptLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpOutsourceReceiptQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpOutsourceReceiptService;
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
 * 委外到货单接口（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 委外到货单头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/outsource/receipts")
@RequiredArgsConstructor
public class ErpOutsourceReceiptController {

    private final ErpOutsourceReceiptService service;

    @GetMapping
    @RequirePermission("erp:outsource:receipt:list")
    public ApiResponse<PageResult<ErpOutsourceReceipt>> page(ErpOutsourceReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:outsource:receipt:list")
    public ApiResponse<ErpOutsourceReceiptDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:outsource:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpOutsourceReceiptSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:outsource:receipt:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpOutsourceReceiptSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:outsource:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:outsource:receipt:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpOutsourceReceiptLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:outsource:receipt:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpOutsourceReceiptLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:outsource:receipt:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
