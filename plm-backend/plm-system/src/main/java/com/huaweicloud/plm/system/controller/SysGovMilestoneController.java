package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovMilestoneQuery;
import com.huaweicloud.plm.system.dto.SysGovMilestoneSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovMilestone;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovMilestoneService;
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
 * 治理里程碑接口（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 里程碑登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/milestones")
@RequiredArgsConstructor
public class SysGovMilestoneController {

    private final SysGovMilestoneService service;

    @GetMapping
    @RequirePermission("platform:gov:milestone:list")
    public ApiResponse<PageResult<SysGovMilestone>> page(SysGovMilestoneQuery query) {
        return ApiResponse.success(service.pageMilestones(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:milestone:list")
    public ApiResponse<SysGovMilestone> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:milestone:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovMilestoneSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:milestone:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovMilestoneSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:milestone:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
