package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FinanceQuery;
import com.huaweicloud.plm.system.dto.SysPriceRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysPriceRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysPriceRuleService;
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
 * 含税/未税价格规则接口（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 价格规则登记、启停状态流转。
 */
@RestController
@RequestMapping("/platform/finance/price-rules")
@RequiredArgsConstructor
public class SysPriceRuleController {

    private final SysPriceRuleService service;

    @GetMapping
    @RequirePermission("platform:finance:pricerule:list")
    public ApiResponse<PageResult<SysPriceRule>> page(FinanceQuery query) {
        return ApiResponse.success(service.pagePriceRules(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:finance:pricerule:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:finance:pricerule:list")
    public ApiResponse<SysPriceRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:finance:pricerule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysPriceRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:finance:pricerule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysPriceRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:finance:pricerule:manage")
    public ApiResponse<SysPriceRule> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:finance:pricerule:manage")
    public ApiResponse<SysPriceRule> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:finance:pricerule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
