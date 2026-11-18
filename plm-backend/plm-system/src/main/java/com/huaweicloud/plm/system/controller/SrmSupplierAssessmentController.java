package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierAssessmentQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierAssessmentSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierAssessment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierAssessmentService;
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
 * 供应商考评接口（对应供应商考评）：
 * 考评登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/assessments")
@RequiredArgsConstructor
public class SrmSupplierAssessmentController {

    private final SrmSupplierAssessmentService service;

    @GetMapping
    @RequirePermission("srm:quality:assessment:list")
    public ApiResponse<PageResult<SrmSupplierAssessment>> page(SrmSupplierAssessmentQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:quality:assessment:list")
    public ApiResponse<SrmSupplierAssessment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:quality:assessment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierAssessmentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:quality:assessment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierAssessmentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:quality:assessment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
