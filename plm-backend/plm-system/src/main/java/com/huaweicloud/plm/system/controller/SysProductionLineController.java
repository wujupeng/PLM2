package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysProductionLineSaveRequest;
import com.huaweicloud.plm.system.entity.SysProductionLine;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysProductionLineService;
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
 * 产线接口（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 产线登记、启停状态流转。
 */
@RestController
@RequestMapping("/platform/org/production-lines")
@RequiredArgsConstructor
public class SysProductionLineController {

    private final SysProductionLineService service;

    @GetMapping
    @RequirePermission("platform:org:productionline:list")
    public ApiResponse<PageResult<SysProductionLine>> page(OrgQuery query) {
        return ApiResponse.success(service.pageProductionLines(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:org:productionline:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:org:productionline:list")
    public ApiResponse<SysProductionLine> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:org:productionline:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysProductionLineSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:org:productionline:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysProductionLineSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:org:productionline:manage")
    public ApiResponse<SysProductionLine> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:org:productionline:manage")
    public ApiResponse<SysProductionLine> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:org:productionline:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
