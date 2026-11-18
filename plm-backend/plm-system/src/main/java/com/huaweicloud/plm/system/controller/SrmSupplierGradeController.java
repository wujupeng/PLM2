package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierGradeQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierGradeSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierGrade;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierGradeService;
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
 * 供应商分级接口（对应 SRM 供应商管理—供应商分级）：
 * 分级记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/supplier-grades")
@RequiredArgsConstructor
public class SrmSupplierGradeController {

    private final SrmSupplierGradeService service;

    @GetMapping
    @RequirePermission("srm:supplier:grade:list")
    public ApiResponse<PageResult<SrmSupplierGrade>> page(SrmSupplierGradeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:supplier:grade:list")
    public ApiResponse<SrmSupplierGrade> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:supplier:grade:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierGradeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:supplier:grade:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierGradeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:supplier:grade:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
