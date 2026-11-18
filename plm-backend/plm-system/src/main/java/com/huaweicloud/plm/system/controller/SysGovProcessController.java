package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovProcessQuery;
import com.huaweicloud.plm.system.dto.SysGovProcessSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovProcess;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovProcessService;
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
 * 端到端流程接口（G1-N7 治理中心 T003 流程建模）：流程模型登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/processes")
@RequiredArgsConstructor
public class SysGovProcessController {

    private final SysGovProcessService service;

    @GetMapping
    @RequirePermission("platform:gov:process:list")
    public ApiResponse<PageResult<SysGovProcess>> page(SysGovProcessQuery query) {
        return ApiResponse.success(service.pageProcesses(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:process:list")
    public ApiResponse<SysGovProcess> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:process:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovProcessSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:process:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovProcessSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:process:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
