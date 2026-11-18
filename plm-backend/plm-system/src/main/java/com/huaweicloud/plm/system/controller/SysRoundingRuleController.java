package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FinanceQuery;
import com.huaweicloud.plm.system.dto.SysRoundingRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysRoundingRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysRoundingRuleService;
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
 * 舍入规则接口（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 舍入规则登记、启停状态流转。
 */
@RestController
@RequestMapping("/platform/finance/rounding-rules")
@RequiredArgsConstructor
public class SysRoundingRuleController {

    private final SysRoundingRuleService service;

    @GetMapping
    @RequirePermission("platform:finance:roundingrule:list")
    public ApiResponse<PageResult<SysRoundingRule>> page(FinanceQuery query) {
        return ApiResponse.success(service.pageRoundingRules(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:finance:roundingrule:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:finance:roundingrule:list")
    public ApiResponse<SysRoundingRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:finance:roundingrule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysRoundingRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:finance:roundingrule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysRoundingRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:finance:roundingrule:manage")
    public ApiResponse<SysRoundingRule> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:finance:roundingrule:manage")
    public ApiResponse<SysRoundingRule> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:finance:roundingrule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
