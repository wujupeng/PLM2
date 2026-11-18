package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DataQualityRuleQuery;
import com.huaweicloud.plm.system.dto.SysDataQualityRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysDataQualityRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDataQualityRuleService;
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
 * 数据质量规则接口（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 规则登记、启停状态流转与统计。
 */
@RestController
@RequestMapping("/platform/data-quality/rules")
@RequiredArgsConstructor
public class SysDataQualityRuleController {

    private final SysDataQualityRuleService service;

    @GetMapping
    @RequirePermission("platform:dq:rule:list")
    public ApiResponse<PageResult<SysDataQualityRule>> page(DataQualityRuleQuery query) {
        return ApiResponse.success(service.pageRules(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:dq:rule:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:dq:rule:list")
    public ApiResponse<SysDataQualityRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:dq:rule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysDataQualityRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:dq:rule:manage")
    public ApiResponse<Long> update(@PathVariable Long id,
                                    @Valid @RequestBody SysDataQualityRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:dq:rule:manage")
    public ApiResponse<SysDataQualityRule> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:dq:rule:manage")
    public ApiResponse<SysDataQualityRule> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:dq:rule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
