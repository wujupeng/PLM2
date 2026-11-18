package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovTaskQuery;
import com.huaweicloud.plm.system.dto.SysGovTaskSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovTaskService;
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
 * 治理任务接口（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/tasks")
@RequiredArgsConstructor
public class SysGovTaskController {

    private final SysGovTaskService service;

    @GetMapping
    @RequirePermission("platform:gov:task:list")
    public ApiResponse<PageResult<SysGovTask>> page(SysGovTaskQuery query) {
        return ApiResponse.success(service.pageTasks(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:task:list")
    public ApiResponse<SysGovTask> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:task:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovTaskSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:task:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovTaskSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:task:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
