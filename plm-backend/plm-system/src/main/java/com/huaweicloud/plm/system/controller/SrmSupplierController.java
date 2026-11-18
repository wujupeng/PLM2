package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplier;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierService;
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
 * 供应商主档接口（对应 G4-N1 SRM 供应商全生命周期）：
 * 供应商主数据登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/suppliers")
@RequiredArgsConstructor
public class SrmSupplierController {

    private final SrmSupplierService service;

    @GetMapping
    @RequirePermission("srm:supplier:archive:list")
    public ApiResponse<PageResult<SrmSupplier>> page(SrmSupplierQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:supplier:archive:list")
    public ApiResponse<SrmSupplier> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:supplier:archive:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:supplier:archive:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:supplier:archive:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
