package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FinanceQuery;
import com.huaweicloud.plm.system.dto.SysTaxRateSaveRequest;
import com.huaweicloud.plm.system.entity.SysTaxRate;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysTaxRateService;
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

import java.util.Map;

/**
 * 税率接口（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 税率登记、生效/过期/停用状态流转。
 */
@RestController
@RequestMapping("/platform/finance/tax-rates")
@RequiredArgsConstructor
public class SysTaxRateController {

    private final SysTaxRateService service;

    @GetMapping
    @RequirePermission("platform:finance:taxrate:list")
    public ApiResponse<PageResult<SysTaxRate>> page(FinanceQuery query) {
        return ApiResponse.success(service.pageTaxRates(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:finance:taxrate:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:finance:taxrate:list")
    public ApiResponse<SysTaxRate> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:finance:taxrate:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysTaxRateSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:finance:taxrate:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysTaxRateSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:finance:taxrate:manage")
    public ApiResponse<SysTaxRate> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:finance:taxrate:manage")
    public ApiResponse<SysTaxRate> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    /** 过期。 */
    @PostMapping("/{id}/expire")
    @RequirePermission("platform:finance:taxrate:manage")
    public ApiResponse<SysTaxRate> expire(@PathVariable Long id) {
        return ApiResponse.success(service.expire(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:finance:taxrate:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
