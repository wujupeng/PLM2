package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierQualificationQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierQualificationSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierQualification;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierQualificationService;
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
 * 供应商资质接口（SRM 供应商资质）：
 * 资质记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/supplier-qualifications")
@RequiredArgsConstructor
public class SrmSupplierQualificationController {

    private final SrmSupplierQualificationService service;

    @GetMapping
    @RequirePermission("srm:supplier:qualification:list")
    public ApiResponse<PageResult<SrmSupplierQualification>> page(SrmSupplierQualificationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:supplier:qualification:list")
    public ApiResponse<SrmSupplierQualification> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:supplier:qualification:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierQualificationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:supplier:qualification:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierQualificationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:supplier:qualification:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
