package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.CodeRuleDetailResponse;
import com.huaweicloud.plm.system.dto.CodeRulePreviewRequest;
import com.huaweicloud.plm.system.dto.CodeRulePreviewResponse;
import com.huaweicloud.plm.system.dto.CodeRuleQuery;
import com.huaweicloud.plm.system.dto.CodeRuleSaveRequest;
import com.huaweicloud.plm.system.dto.CodeRuleSegmentSaveRequest;
import com.huaweicloud.plm.system.entity.CodeRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.CodeRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 编码规则接口（DEV-051 / DEV-052 / DEV-062）。
 */
@RestController
@RequestMapping("/code/rules")
@RequiredArgsConstructor
public class CodeRuleController {

    private final CodeRuleService codeRuleService;

    @GetMapping
    @RequirePermission("code:rule:list")
    public ApiResponse<PageResult<CodeRule>> page(CodeRuleQuery query) {
        return ApiResponse.success(codeRuleService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("code:rule:list")
    public ApiResponse<List<CodeRule>> options(@RequestParam(required = false) String codeType) {
        return ApiResponse.success(codeRuleService.listOptions(codeType));
    }

    @GetMapping("/{ruleId}")
    @RequirePermission("code:rule:list")
    public ApiResponse<CodeRuleDetailResponse> detail(@PathVariable Long ruleId) {
        return ApiResponse.success(codeRuleService.detail(ruleId));
    }

    @PostMapping
    @RequirePermission("code:rule:save")
    public ApiResponse<Long> create(@Valid @RequestBody CodeRuleSaveRequest request) {
        return ApiResponse.success(codeRuleService.create(request));
    }

    @PutMapping("/{ruleId}")
    @RequirePermission("code:rule:save")
    public ApiResponse<Void> update(@PathVariable Long ruleId,
                                    @Valid @RequestBody CodeRuleSaveRequest request) {
        codeRuleService.update(ruleId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{ruleId}")
    @RequirePermission("code:rule:delete")
    public ApiResponse<Void> delete(@PathVariable Long ruleId) {
        codeRuleService.delete(ruleId);
        return ApiResponse.success();
    }

    @PutMapping("/{ruleId}/segments")
    @RequirePermission("code:rule:save")
    public ApiResponse<Void> saveSegments(@PathVariable Long ruleId,
                                          @RequestBody List<CodeRuleSegmentSaveRequest> segments) {
        codeRuleService.saveSegments(ruleId, segments);
        return ApiResponse.success();
    }

    @PostMapping("/{ruleId}/enable")
    @RequirePermission("code:rule:save")
    public ApiResponse<Void> enable(@PathVariable Long ruleId) {
        codeRuleService.enable(ruleId);
        return ApiResponse.success();
    }

    @PostMapping("/{ruleId}/disable")
    @RequirePermission("code:rule:save")
    public ApiResponse<Void> disable(@PathVariable Long ruleId) {
        codeRuleService.disable(ruleId);
        return ApiResponse.success();
    }

    @PostMapping("/preview")
    @RequirePermission("code:rule:list")
    public ApiResponse<CodeRulePreviewResponse> preview(@RequestBody CodeRulePreviewRequest request) {
        return ApiResponse.success(codeRuleService.preview(request));
    }
}
