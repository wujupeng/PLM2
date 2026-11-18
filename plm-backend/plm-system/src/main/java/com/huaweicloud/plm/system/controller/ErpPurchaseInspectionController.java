package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpPurchaseInspectionQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseInspection;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpPurchaseInspectionService;
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
 * 采购报检/检验单接口（G3-N3a ERP 采购管理）：
 * 采购报检/检验单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/purchase/inspections")
@RequiredArgsConstructor
public class ErpPurchaseInspectionController {

    private final ErpPurchaseInspectionService service;

    @GetMapping
    @RequirePermission("erp:purchase:inspection:list")
    public ApiResponse<PageResult<ErpPurchaseInspection>> page(ErpPurchaseInspectionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:purchase:inspection:list")
    public ApiResponse<ErpPurchaseInspection> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:purchase:inspection:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpPurchaseInspectionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:purchase:inspection:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpPurchaseInspectionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:purchase:inspection:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
