package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DocStateQuery;
import com.huaweicloud.plm.system.dto.SysDocStateDefSaveRequest;
import com.huaweicloud.plm.system.entity.SysDocStateDef;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDocStateDefService;
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
 * 单据状态定义接口（G1-N6 公共平台底座—通用能力 WBS T102 单据状态机）：
 * 状态定义登记、启停状态流转与统计。
 */
@RestController
@RequestMapping("/platform/doc-state/state-defs")
@RequiredArgsConstructor
public class SysDocStateDefController {

    private final SysDocStateDefService service;

    @GetMapping
    @RequirePermission("platform:docstate:docstate:list")
    public ApiResponse<PageResult<SysDocStateDef>> page(DocStateQuery query) {
        return ApiResponse.success(service.pageStateDefs(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:docstate:docstate:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:docstate:docstate:list")
    public ApiResponse<SysDocStateDef> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:docstate:docstate:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysDocStateDefSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:docstate:docstate:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysDocStateDefSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:docstate:docstate:manage")
    public ApiResponse<SysDocStateDef> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:docstate:docstate:manage")
    public ApiResponse<SysDocStateDef> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:docstate:docstate:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
