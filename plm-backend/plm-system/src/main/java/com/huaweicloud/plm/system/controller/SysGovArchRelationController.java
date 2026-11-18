package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovArchRelationQuery;
import com.huaweicloud.plm.system.dto.SysGovArchRelationSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovArchRelation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovArchRelationService;
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
 * 架构关系接口（G1-N7 公共平台底座—治理中心 WBS T005 总体架构）：
 * 架构关系登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/arch-relations")
@RequiredArgsConstructor
public class SysGovArchRelationController {

    private final SysGovArchRelationService service;

    @GetMapping
    @RequirePermission("platform:gov:archrelation:list")
    public ApiResponse<PageResult<SysGovArchRelation>> page(SysGovArchRelationQuery query) {
        return ApiResponse.success(service.pageArchRelations(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:archrelation:list")
    public ApiResponse<SysGovArchRelation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:archrelation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovArchRelationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:archrelation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovArchRelationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:archrelation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
