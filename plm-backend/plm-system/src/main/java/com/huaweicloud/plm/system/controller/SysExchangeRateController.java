package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FinanceQuery;
import com.huaweicloud.plm.system.dto.SysExchangeRateSaveRequest;
import com.huaweicloud.plm.system.entity.SysExchangeRate;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysExchangeRateService;
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
 * 汇率接口（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 汇率登记、生效/过期/停用状态流转。
 */
@RestController
@RequestMapping("/platform/finance/exchange-rates")
@RequiredArgsConstructor
public class SysExchangeRateController {

    private final SysExchangeRateService service;

    @GetMapping
    @RequirePermission("platform:finance:exchangerate:list")
    public ApiResponse<PageResult<SysExchangeRate>> page(FinanceQuery query) {
        return ApiResponse.success(service.pageExchangeRates(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:finance:exchangerate:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:finance:exchangerate:list")
    public ApiResponse<SysExchangeRate> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:finance:exchangerate:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysExchangeRateSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:finance:exchangerate:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysExchangeRateSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:finance:exchangerate:manage")
    public ApiResponse<SysExchangeRate> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:finance:exchangerate:manage")
    public ApiResponse<SysExchangeRate> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    /** 过期。 */
    @PostMapping("/{id}/expire")
    @RequirePermission("platform:finance:exchangerate:manage")
    public ApiResponse<SysExchangeRate> expire(@PathVariable Long id) {
        return ApiResponse.success(service.expire(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:finance:exchangerate:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
