package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovRiskQuery;
import com.huaweicloud.plm.system.dto.SysGovRiskSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovRisk;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovRiskService;
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
 * 治理风险接口（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 风险登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/risks")
@RequiredArgsConstructor
public class SysGovRiskController {

    private final SysGovRiskService service;

    @GetMapping
    @RequirePermission("platform:gov:risk:list")
    public ApiResponse<PageResult<SysGovRisk>> page(SysGovRiskQuery query) {
        return ApiResponse.success(service.pageRisks(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:risk:list")
    public ApiResponse<SysGovRisk> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:risk:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovRiskSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:risk:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovRiskSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:risk:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
