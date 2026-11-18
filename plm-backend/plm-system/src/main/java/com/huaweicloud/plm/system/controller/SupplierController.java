package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SupplierQuery;
import com.huaweicloud.plm.system.dto.SupplierSaveRequest;
import com.huaweicloud.plm.system.entity.MdSupplier;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SupplierService;
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

import java.util.List;

/**
 * 供应商主数据接口（DEV-022）。
 */
@RestController
@RequestMapping("/product-data/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @RequirePermission("supplier:list")
    public ApiResponse<PageResult<MdSupplier>> page(SupplierQuery query) {
        return ApiResponse.success(supplierService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("supplier:list")
    public ApiResponse<List<MdSupplier>> options() {
        return ApiResponse.success(supplierService.options());
    }

    @PostMapping
    @RequirePermission("supplier:create")
    public ApiResponse<Long> create(@Valid @RequestBody SupplierSaveRequest request) {
        return ApiResponse.success(supplierService.create(request));
    }

    @PutMapping("/{supplierId}")
    @RequirePermission("supplier:update")
    public ApiResponse<Void> update(@PathVariable Long supplierId, @Valid @RequestBody SupplierSaveRequest request) {
        supplierService.update(supplierId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{supplierId}")
    @RequirePermission("supplier:delete")
    public ApiResponse<Void> delete(@PathVariable Long supplierId) {
        supplierService.delete(supplierId);
        return ApiResponse.success();
    }
}
