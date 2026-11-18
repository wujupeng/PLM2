package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmPriceCompareQuery;
import com.huaweicloud.plm.system.dto.SrmPriceCompareSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPriceCompare;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmPriceCompareService;
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
 * 报价比价接口（对应报价比价）：
 * 比价记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/price-compares")
@RequiredArgsConstructor
public class SrmPriceCompareController {

    private final SrmPriceCompareService service;

    @GetMapping
    @RequirePermission("srm:sourcing:compare:list")
    public ApiResponse<PageResult<SrmPriceCompare>> page(SrmPriceCompareQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:sourcing:compare:list")
    public ApiResponse<SrmPriceCompare> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:sourcing:compare:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmPriceCompareSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:sourcing:compare:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmPriceCompareSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:sourcing:compare:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
