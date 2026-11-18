package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.LabelRuleQuery;
import com.huaweicloud.plm.system.dto.LabelRuleSaveRequest;
import com.huaweicloud.plm.system.dto.LabelValidateRequest;
import com.huaweicloud.plm.system.dto.LabelValidateResult;
import com.huaweicloud.plm.system.entity.SysLabelRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysLabelRuleService;
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
 * 标签校验规则接口（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 规则登记、分页查询、条码校验与删除。
 */
@RestController
@RequestMapping("/platform/mobile/label-rules")
@RequiredArgsConstructor
public class SysLabelRuleController {

    private final SysLabelRuleService service;

    @GetMapping
    @RequirePermission("platform:mobile:labelrule:list")
    public ApiResponse<PageResult<SysLabelRule>> page(LabelRuleQuery query) {
        return ApiResponse.success(service.pageRules(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mobile:labelrule:list")
    public ApiResponse<SysLabelRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mobile:labelrule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody LabelRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mobile:labelrule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody LabelRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 校验条码：按标签类型取生效规则逐条校验，返回是否通过与命中规则。 */
    @PostMapping("/validate")
    @RequirePermission("platform:mobile:labelrule:list")
    public ApiResponse<LabelValidateResult> validate(@Valid @RequestBody LabelValidateRequest request) {
        return ApiResponse.success(service.validate(request.getBarcode(), request.getLabelType()));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mobile:labelrule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
