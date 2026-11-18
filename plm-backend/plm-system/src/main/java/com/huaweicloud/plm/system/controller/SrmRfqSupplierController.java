package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmRfqSupplierQuery;
import com.huaweicloud.plm.system.dto.SrmRfqSupplierSaveRequest;
import com.huaweicloud.plm.system.entity.SrmRfqSupplier;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmRfqSupplierService;
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
 * 询价邀请供应商接口（对应询价邀请供应商）：
 * 询价邀请记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/rfq-suppliers")
@RequiredArgsConstructor
public class SrmRfqSupplierController {

    private final SrmRfqSupplierService service;

    @GetMapping
    @RequirePermission("srm:sourcing:rfq-supplier:list")
    public ApiResponse<PageResult<SrmRfqSupplier>> page(SrmRfqSupplierQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:sourcing:rfq-supplier:list")
    public ApiResponse<SrmRfqSupplier> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:sourcing:rfq-supplier:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmRfqSupplierSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:sourcing:rfq-supplier:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmRfqSupplierSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:sourcing:rfq-supplier:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
