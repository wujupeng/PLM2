package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizRuleLogQuery;
import com.huaweicloud.plm.system.dto.SysBizRuleLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysBizRuleLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysBizRuleLogService;
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
 * 规则执行日志接口（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 规则执行日志登记、查询与统计。
 */
@RestController
@RequestMapping("/platform/biz-rule/logs")
@RequiredArgsConstructor
public class SysBizRuleLogController {

    private final SysBizRuleLogService service;

    @GetMapping
    @RequirePermission("platform:bizrule:log:list")
    public ApiResponse<PageResult<SysBizRuleLog>> page(BizRuleLogQuery query) {
        return ApiResponse.success(service.pageLogs(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:bizrule:log:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:bizrule:log:list")
    public ApiResponse<SysBizRuleLog> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:bizrule:log:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysBizRuleLogSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:bizrule:log:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysBizRuleLogSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:bizrule:log:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
