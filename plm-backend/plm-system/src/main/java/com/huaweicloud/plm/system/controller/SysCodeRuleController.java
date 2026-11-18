package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.CodeRuleGenerateResult;
import com.huaweicloud.plm.system.dto.SysCodeRuleQuery;
import com.huaweicloud.plm.system.dto.SysCodeRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysCodeRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysCodeRuleService;
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
 * 编码规则接口（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 编码规则登记、启停状态流转、编码生成与统计。
 */
@RestController
@RequestMapping("/platform/data-quality/code-rules")
@RequiredArgsConstructor
public class SysCodeRuleController {

    private final SysCodeRuleService service;

    @GetMapping
    @RequirePermission("platform:dq:coderule:list")
    public ApiResponse<PageResult<SysCodeRule>> page(SysCodeRuleQuery query) {
        return ApiResponse.success(service.pageCodeRules(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:dq:coderule:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:dq:coderule:list")
    public ApiResponse<SysCodeRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:dq:coderule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysCodeRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:dq:coderule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysCodeRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 生成编码：当前流水值自增 1 并写回，返回前缀 + 日期段 + 流水号拼接结果。 */
    @PostMapping("/{id}/generate")
    @RequirePermission("platform:dq:coderule:manage")
    public ApiResponse<CodeRuleGenerateResult> generate(@PathVariable Long id) {
        return ApiResponse.success(service.generate(id));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:dq:coderule:manage")
    public ApiResponse<SysCodeRule> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:dq:coderule:manage")
    public ApiResponse<SysCodeRule> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:dq:coderule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
