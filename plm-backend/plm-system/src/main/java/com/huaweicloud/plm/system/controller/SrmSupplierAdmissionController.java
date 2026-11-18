package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierAdmissionQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierAdmissionSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierAdmission;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierAdmissionService;
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
 * 供应商准入接口（SRM 供应商准入）：
 * 准入记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/supplier-admissions")
@RequiredArgsConstructor
public class SrmSupplierAdmissionController {

    private final SrmSupplierAdmissionService service;

    @GetMapping
    @RequirePermission("srm:supplier:admission:list")
    public ApiResponse<PageResult<SrmSupplierAdmission>> page(SrmSupplierAdmissionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:supplier:admission:list")
    public ApiResponse<SrmSupplierAdmission> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:supplier:admission:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierAdmissionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:supplier:admission:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierAdmissionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:supplier:admission:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
