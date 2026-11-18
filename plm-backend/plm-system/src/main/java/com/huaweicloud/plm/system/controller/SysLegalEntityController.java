package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysLegalEntitySaveRequest;
import com.huaweicloud.plm.system.entity.SysLegalEntity;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysLegalEntityService;
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
 * 法人主体接口（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 法人主体登记、启停状态流转。
 */
@RestController
@RequestMapping("/platform/org/legal-entities")
@RequiredArgsConstructor
public class SysLegalEntityController {

    private final SysLegalEntityService service;

    @GetMapping
    @RequirePermission("platform:org:legalentity:list")
    public ApiResponse<PageResult<SysLegalEntity>> page(OrgQuery query) {
        return ApiResponse.success(service.pageLegalEntities(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:org:legalentity:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:org:legalentity:list")
    public ApiResponse<SysLegalEntity> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:org:legalentity:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysLegalEntitySaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:org:legalentity:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysLegalEntitySaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:org:legalentity:manage")
    public ApiResponse<SysLegalEntity> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:org:legalentity:manage")
    public ApiResponse<SysLegalEntity> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:org:legalentity:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
