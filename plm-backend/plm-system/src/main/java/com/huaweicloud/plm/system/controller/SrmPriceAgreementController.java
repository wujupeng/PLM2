package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmPriceAgreementQuery;
import com.huaweicloud.plm.system.dto.SrmPriceAgreementSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPriceAgreement;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmPriceAgreementService;
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
 * 定点定价协议接口（对应定点定价协议）：
 * 协议登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/price-agreements")
@RequiredArgsConstructor
public class SrmPriceAgreementController {

    private final SrmPriceAgreementService service;

    @GetMapping
    @RequirePermission("srm:sourcing:price:list")
    public ApiResponse<PageResult<SrmPriceAgreement>> page(SrmPriceAgreementQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:sourcing:price:list")
    public ApiResponse<SrmPriceAgreement> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:sourcing:price:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmPriceAgreementSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:sourcing:price:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmPriceAgreementSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:sourcing:price:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
