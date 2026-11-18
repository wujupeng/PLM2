package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizRuleParamQuery;
import com.huaweicloud.plm.system.dto.SysBizRuleParamSaveRequest;
import com.huaweicloud.plm.system.entity.SysBizRuleParam;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysBizRuleParamService;
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
 * 规则参数接口（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 规则参数登记、启停状态流转与统计。
 */
@RestController
@RequestMapping("/platform/biz-rule/params")
@RequiredArgsConstructor
public class SysBizRuleParamController {

    private final SysBizRuleParamService service;

    @GetMapping
    @RequirePermission("platform:bizrule:param:list")
    public ApiResponse<PageResult<SysBizRuleParam>> page(BizRuleParamQuery query) {
        return ApiResponse.success(service.pageParams(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:bizrule:param:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:bizrule:param:list")
    public ApiResponse<SysBizRuleParam> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:bizrule:param:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysBizRuleParamSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:bizrule:param:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysBizRuleParamSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:bizrule:param:manage")
    public ApiResponse<SysBizRuleParam> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:bizrule:param:manage")
    public ApiResponse<SysBizRuleParam> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:bizrule:param:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
