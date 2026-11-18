package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysGovProcessNodeQuery;
import com.huaweicloud.plm.system.dto.SysGovProcessNodeSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovProcessNode;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysGovProcessNodeService;
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
 * 流程节点接口（G1-N7 治理中心 T003 流程建模）：节点登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/governance/process-nodes")
@RequiredArgsConstructor
public class SysGovProcessNodeController {

    private final SysGovProcessNodeService service;

    @GetMapping
    @RequirePermission("platform:gov:processnode:list")
    public ApiResponse<PageResult<SysGovProcessNode>> page(SysGovProcessNodeQuery query) {
        return ApiResponse.success(service.pageNodes(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:gov:processnode:list")
    public ApiResponse<SysGovProcessNode> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:gov:processnode:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysGovProcessNodeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:gov:processnode:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysGovProcessNodeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:gov:processnode:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
