package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSupplierQuoteQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierQuoteSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierQuote;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSupplierQuoteService;
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
 * 供应商报价接口（对应供应商报价）：
 * 报价记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/supplier-quotes")
@RequiredArgsConstructor
public class SrmSupplierQuoteController {

    private final SrmSupplierQuoteService service;

    @GetMapping
    @RequirePermission("srm:sourcing:quote:list")
    public ApiResponse<PageResult<SrmSupplierQuote>> page(SrmSupplierQuoteQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:sourcing:quote:list")
    public ApiResponse<SrmSupplierQuote> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:sourcing:quote:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSupplierQuoteSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:sourcing:quote:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSupplierQuoteSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:sourcing:quote:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
