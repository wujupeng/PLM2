package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MfgPackageRuleQuery;
import com.huaweicloud.plm.system.dto.MfgPackageRuleSaveRequest;
import com.huaweicloud.plm.system.entity.MfgPackageRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MfgPackageRuleService;
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
 * 包装规则接口（N8，DEV-089）：包装数量、内外箱关系与标签模板规则。
 */
@RestController
@RequestMapping("/mfg/package-rules")
@RequiredArgsConstructor
public class MfgPackageRuleController {

    private final MfgPackageRuleService mfgPackageRuleService;

    @GetMapping
    @RequirePermission("mfg:package:list")
    public ApiResponse<PageResult<MfgPackageRule>> page(MfgPackageRuleQuery query) {
        return ApiResponse.success(mfgPackageRuleService.page(query));
    }

    @GetMapping("/active")
    @RequirePermission("mfg:package:list")
    public ApiResponse<List<MfgPackageRule>> listActive(@RequestParam(required = false) String productCode,
                                                        @RequestParam(required = false) String packageLevel) {
        return ApiResponse.success(mfgPackageRuleService.listActive(productCode, packageLevel));
    }

    @GetMapping("/{ruleNo}")
    @RequirePermission("mfg:package:list")
    public ApiResponse<MfgPackageRule> detail(@PathVariable String ruleNo) {
        return ApiResponse.success(mfgPackageRuleService.require(ruleNo));
    }

    @PostMapping
    @RequirePermission("mfg:package:save")
    public ApiResponse<String> create(@Valid @RequestBody MfgPackageRuleSaveRequest request) {
        mfgPackageRuleService.create(request);
        return ApiResponse.success(request.getRuleNo());
    }

    @PutMapping("/{ruleNo}")
    @RequirePermission("mfg:package:save")
    public ApiResponse<Void> update(@PathVariable String ruleNo,
                                    @Valid @RequestBody MfgPackageRuleSaveRequest request) {
        mfgPackageRuleService.update(ruleNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{ruleNo}")
    @RequirePermission("mfg:package:save")
    public ApiResponse<Void> delete(@PathVariable String ruleNo) {
        mfgPackageRuleService.delete(ruleNo);
        return ApiResponse.success();
    }
}
