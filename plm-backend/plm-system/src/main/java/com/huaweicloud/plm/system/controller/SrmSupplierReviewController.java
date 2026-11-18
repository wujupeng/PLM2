package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierReviewQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierReviewSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierReview;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierReviewService;
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
 * 供应商年度复审接口（对应供应商年度复审）：
 * 复审记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/supplier-reviews")
@RequiredArgsConstructor
public class SrmSupplierReviewController {

    private final SrmSupplierReviewService service;

    @GetMapping
    @RequirePermission("srm:supplier:review:list")
    public ApiResponse<PageResult<SrmSupplierReview>> page(SrmSupplierReviewQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:supplier:review:list")
    public ApiResponse<SrmSupplierReview> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:supplier:review:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierReviewSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:supplier:review:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierReviewSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:supplier:review:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
