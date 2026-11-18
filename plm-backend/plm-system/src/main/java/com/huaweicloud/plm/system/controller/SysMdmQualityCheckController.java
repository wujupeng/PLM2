package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysMdmQualityCheckQuery;
import com.huaweicloud.plm.system.dto.SysMdmQualityCheckSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmQualityCheck;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMdmQualityCheckService;
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
 * 主数据质量校验接口（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 质量校验登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/mdm/quality-checks")
@RequiredArgsConstructor
public class SysMdmQualityCheckController {

    private final SysMdmQualityCheckService service;

    @GetMapping
    @RequirePermission("platform:mdm:qualitycheck:list")
    public ApiResponse<PageResult<SysMdmQualityCheck>> page(SysMdmQualityCheckQuery query) {
        return ApiResponse.success(service.pageQualityChecks(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mdm:qualitycheck:list")
    public ApiResponse<SysMdmQualityCheck> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mdm:qualitycheck:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMdmQualityCheckSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mdm:qualitycheck:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMdmQualityCheckSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mdm:qualitycheck:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
