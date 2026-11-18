package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizRuleQuery;
import com.huaweicloud.plm.system.dto.RuleEvaluateRequest;
import com.huaweicloud.plm.system.dto.RuleEvaluateResult;
import com.huaweicloud.plm.system.dto.SysBizRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysBizRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysBizRuleService;
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
 * 业务规则定义接口（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 业务规则登记、启停状态流转、规则求值与统计。
 */
@RestController
@RequestMapping("/platform/biz-rule/rules")
@RequiredArgsConstructor
public class SysBizRuleController {

    private final SysBizRuleService service;

    @GetMapping
    @RequirePermission("platform:bizrule:rule:list")
    public ApiResponse<PageResult<SysBizRule>> page(BizRuleQuery query) {
        return ApiResponse.success(service.pageRules(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:bizrule:rule:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    /** 规则求值：按规则类型（可选业务模块）匹配生效规则并返回命中结果与规则参数。 */
    @PostMapping("/evaluate")
    @RequirePermission("platform:bizrule:rule:list")
    public ApiResponse<RuleEvaluateResult> evaluate(@Valid @RequestBody RuleEvaluateRequest request) {
        return ApiResponse.success(service.evaluate(request));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:bizrule:rule:list")
    public ApiResponse<SysBizRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:bizrule:rule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysBizRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:bizrule:rule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysBizRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:bizrule:rule:manage")
    public ApiResponse<SysBizRule> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:bizrule:rule:manage")
    public ApiResponse<SysBizRule> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:bizrule:rule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
