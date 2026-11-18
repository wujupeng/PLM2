package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierRiskQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierRiskSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierRisk;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierRiskService;
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
 * 供应商风险接口（对应 SRM 供应商风险管理）：
 * 风险记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/supplier-risks")
@RequiredArgsConstructor
public class SrmSupplierRiskController {

    private final SrmSupplierRiskService service;

    @GetMapping
    @RequirePermission("srm:supplier:risk:list")
    public ApiResponse<PageResult<SrmSupplierRisk>> page(SrmSupplierRiskQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:supplier:risk:list")
    public ApiResponse<SrmSupplierRisk> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:supplier:risk:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierRiskSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:supplier:risk:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierRiskSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:supplier:risk:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
