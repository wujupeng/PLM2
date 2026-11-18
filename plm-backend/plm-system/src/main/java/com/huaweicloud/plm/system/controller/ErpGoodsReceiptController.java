package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptDetailResponse;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptQuery;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.ErpGoodsReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpGoodsReceiptService;
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
 * 采购到货单接口（G3-N3a ERP 采购管理）：
 * 采购到货单头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/purchase/receipts")
@RequiredArgsConstructor
public class ErpGoodsReceiptController {

    private final ErpGoodsReceiptService service;

    @GetMapping
    @RequirePermission("erp:purchase:receipt:list")
    public ApiResponse<PageResult<ErpGoodsReceipt>> page(ErpGoodsReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:purchase:receipt:list")
    public ApiResponse<ErpGoodsReceiptDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:purchase:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpGoodsReceiptSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:purchase:receipt:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpGoodsReceiptSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:purchase:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:purchase:receipt:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpGoodsReceiptLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:purchase:receipt:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpGoodsReceiptLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:purchase:receipt:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
