package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiSupplierMaterialQuery;
import com.huaweicloud.plm.system.dto.EdiSupplierMaterialSaveRequest;
import com.huaweicloud.plm.system.entity.EdiSupplierMaterial;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiSupplierMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 供应商供货关系与分配规则接口（N6，DEV-070）。
 */
@RestController
@RequestMapping("/edi/supplier-materials")
@RequiredArgsConstructor
public class EdiSupplierMaterialController {

    private final EdiSupplierMaterialService ediSupplierMaterialService;

    @GetMapping
    @RequirePermission("edi:suppliermaterial:list")
    public ApiResponse<PageResult<EdiSupplierMaterial>> page(EdiSupplierMaterialQuery query) {
        return ApiResponse.success(ediSupplierMaterialService.page(query));
    }

    @GetMapping("/by-material")
    @RequirePermission("edi:suppliermaterial:list")
    public ApiResponse<List<EdiSupplierMaterial>> byMaterial(@RequestParam String materialCode) {
        return ApiResponse.success(ediSupplierMaterialService.listByMaterial(materialCode));
    }

    @GetMapping("/{supplierMaterialId}")
    @RequirePermission("edi:suppliermaterial:list")
    public ApiResponse<EdiSupplierMaterial> detail(@PathVariable Long supplierMaterialId) {
        return ApiResponse.success(ediSupplierMaterialService.requireById(supplierMaterialId));
    }

    @PostMapping
    @RequirePermission("edi:suppliermaterial:save")
    public ApiResponse<Long> create(@Valid @RequestBody EdiSupplierMaterialSaveRequest request) {
        return ApiResponse.success(ediSupplierMaterialService.create(request));
    }

    @PutMapping("/{supplierMaterialId}")
    @RequirePermission("edi:suppliermaterial:save")
    public ApiResponse<Void> update(@PathVariable Long supplierMaterialId,
                                    @Valid @RequestBody EdiSupplierMaterialSaveRequest request) {
        ediSupplierMaterialService.update(supplierMaterialId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{supplierMaterialId}")
    @RequirePermission("edi:suppliermaterial:save")
    public ApiResponse<Void> delete(@PathVariable Long supplierMaterialId) {
        ediSupplierMaterialService.delete(supplierMaterialId);
        return ApiResponse.success();
    }
}
