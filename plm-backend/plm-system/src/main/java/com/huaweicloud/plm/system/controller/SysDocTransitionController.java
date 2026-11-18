package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DocTransitionQuery;
import com.huaweicloud.plm.system.dto.SysDocTransitionSaveRequest;
import com.huaweicloud.plm.system.entity.SysDocTransition;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDocTransitionService;
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

import java.util.Map;

/**
 * 单据状态流转规则接口（G1-N6 公共平台底座—通用能力 WBS T102 单据状态机）：
 * 流转规则登记、启停状态流转、转运动作校验与统计。
 */
@RestController
@RequestMapping("/platform/doc-state/transitions")
@RequiredArgsConstructor
public class SysDocTransitionController {

    private final SysDocTransitionService service;

    @GetMapping
    @RequirePermission("platform:docstate:transition:list")
    public ApiResponse<PageResult<SysDocTransition>> page(DocTransitionQuery query) {
        return ApiResponse.success(service.pageTransitions(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:docstate:transition:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    /** 校验转运动作：按单据类型 + 起始状态 + 动作返回生效的唯一流转规则，未命中抛出业务异常。 */
    @GetMapping("/validate")
    @RequirePermission("platform:docstate:transition:list")
    public ApiResponse<SysDocTransition> validate(@RequestParam String docType,
                                                  @RequestParam String fromState,
                                                  @RequestParam String actionCode) {
        return ApiResponse.success(service.validate(docType, fromState, actionCode));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:docstate:transition:list")
    public ApiResponse<SysDocTransition> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:docstate:transition:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysDocTransitionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:docstate:transition:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysDocTransitionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:docstate:transition:manage")
    public ApiResponse<SysDocTransition> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:docstate:transition:manage")
    public ApiResponse<SysDocTransition> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:docstate:transition:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
