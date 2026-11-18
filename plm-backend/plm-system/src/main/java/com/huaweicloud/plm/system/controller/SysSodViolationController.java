package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysSodViolationSaveRequest;
import com.huaweicloud.plm.system.entity.SysSodViolation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysSodViolationService;
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
 * 职责分离违规记录接口（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 违规记录登记、整改/忽略处理。
 */
@RestController
@RequestMapping("/platform/iam/sod-violations")
@RequiredArgsConstructor
public class SysSodViolationController {

    private final SysSodViolationService service;

    @GetMapping
    @RequirePermission("platform:iam:sodviolation:list")
    public ApiResponse<PageResult<SysSodViolation>> page(IamQuery query) {
        return ApiResponse.success(service.pageViolations(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:iam:sodviolation:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:iam:sodviolation:list")
    public ApiResponse<SysSodViolation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:iam:sodviolation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysSodViolationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:iam:sodviolation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysSodViolationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 整改。 */
    @PostMapping("/{id}/resolve")
    @RequirePermission("platform:iam:sodviolation:manage")
    public ApiResponse<SysSodViolation> resolve(@PathVariable Long id) {
        return ApiResponse.success(service.resolve(id));
    }

    /** 忽略。 */
    @PostMapping("/{id}/ignore")
    @RequirePermission("platform:iam:sodviolation:manage")
    public ApiResponse<SysSodViolation> ignore(@PathVariable Long id) {
        return ApiResponse.success(service.ignore(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:iam:sodviolation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
