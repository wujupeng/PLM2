package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SpecComplianceCheckResult;
import com.huaweicloud.plm.system.dto.SpecComplianceQuery;
import com.huaweicloud.plm.system.dto.SpecComplianceSaveRequest;
import com.huaweicloud.plm.system.entity.SpecCompliance;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ComplianceService;
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
 * 环保合规接口（DEV-045）。
 */
@RestController
@RequestMapping("/compliance/records")
@RequiredArgsConstructor
public class ComplianceController {

    private final ComplianceService complianceService;

    @GetMapping
    @RequirePermission("compliance:list")
    public ApiResponse<PageResult<SpecCompliance>> page(SpecComplianceQuery query) {
        return ApiResponse.success(complianceService.page(query));
    }

    @GetMapping("/{complianceId}")
    @RequirePermission("compliance:list")
    public ApiResponse<SpecCompliance> getById(@PathVariable Long complianceId) {
        return ApiResponse.success(complianceService.getById(complianceId));
    }

    @GetMapping("/by-material/{materialCode}")
    @RequirePermission("compliance:list")
    public ApiResponse<List<SpecCompliance>> listByMaterial(@PathVariable String materialCode) {
        return ApiResponse.success(complianceService.listByMaterial(materialCode));
    }

    @GetMapping("/expiring")
    @RequirePermission("compliance:list")
    public ApiResponse<List<SpecCompliance>> listExpiring(@RequestParam(required = false) Integer days) {
        return ApiResponse.success(complianceService.listExpiring(days));
    }

    @GetMapping("/check")
    @RequirePermission("compliance:list")
    public ApiResponse<SpecComplianceCheckResult> checkMaterial(@RequestParam String materialCode) {
        return ApiResponse.success(complianceService.checkMaterial(materialCode));
    }

    @PostMapping
    @RequirePermission("compliance:create")
    public ApiResponse<Long> create(@Valid @RequestBody SpecComplianceSaveRequest request) {
        return ApiResponse.success(complianceService.create(request));
    }

    @PutMapping("/{complianceId}")
    @RequirePermission("compliance:update")
    public ApiResponse<Void> update(@PathVariable Long complianceId,
                                    @Valid @RequestBody SpecComplianceSaveRequest request) {
        complianceService.update(complianceId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{complianceId}")
    @RequirePermission("compliance:delete")
    public ApiResponse<Void> delete(@PathVariable Long complianceId) {
        complianceService.delete(complianceId);
        return ApiResponse.success();
    }

    @PostMapping("/{complianceId}/check")
    @RequirePermission("compliance:update")
    public ApiResponse<SpecCompliance> check(@PathVariable Long complianceId) {
        return ApiResponse.success(complianceService.check(complianceId));
    }
}
