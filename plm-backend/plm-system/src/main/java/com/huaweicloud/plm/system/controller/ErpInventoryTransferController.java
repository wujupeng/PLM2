package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpInventoryTransferDetailResponse;
import com.huaweicloud.plm.system.dto.ErpInventoryTransferLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpInventoryTransferQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryTransferSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryTransfer;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpInventoryTransferService;
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
 * 库存调拨接口（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存调拨头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/inventory/transfers")
@RequiredArgsConstructor
public class ErpInventoryTransferController {

    private final ErpInventoryTransferService service;

    @GetMapping
    @RequirePermission("erp:inventory:transfer:list")
    public ApiResponse<PageResult<ErpInventoryTransfer>> page(ErpInventoryTransferQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:inventory:transfer:list")
    public ApiResponse<ErpInventoryTransferDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:inventory:transfer:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpInventoryTransferSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:inventory:transfer:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpInventoryTransferSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:inventory:transfer:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:inventory:transfer:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpInventoryTransferLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:inventory:transfer:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpInventoryTransferLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:inventory:transfer:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
