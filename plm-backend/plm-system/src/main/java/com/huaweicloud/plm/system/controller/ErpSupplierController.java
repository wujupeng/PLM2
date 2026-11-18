package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpSupplierQuery;
import com.huaweicloud.plm.system.dto.ErpSupplierSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSupplier;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpSupplierService;
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
 * 供应商业务档案接口（G3-N1 ERP 基础资料 WBS T021）：
 * 供应商档案登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/base/suppliers")
@RequiredArgsConstructor
public class ErpSupplierController {

    private final ErpSupplierService service;

    @GetMapping
    @RequirePermission("erp:base:supplier:list")
    public ApiResponse<PageResult<ErpSupplier>> page(ErpSupplierQuery query) {
        return ApiResponse.success(service.pageSuppliers(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:base:supplier:list")
    public ApiResponse<ErpSupplier> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:base:supplier:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpSupplierSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:base:supplier:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpSupplierSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:base:supplier:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
