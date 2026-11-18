package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysMdmChangeRequestQuery;
import com.huaweicloud.plm.system.dto.SysMdmChangeRequestSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmChangeRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMdmChangeRequestService;
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
 * 主数据变更申请接口（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 变更申请登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/mdm/change-requests")
@RequiredArgsConstructor
public class SysMdmChangeRequestController {

    private final SysMdmChangeRequestService service;

    @GetMapping
    @RequirePermission("platform:mdm:changerequest:list")
    public ApiResponse<PageResult<SysMdmChangeRequest>> page(SysMdmChangeRequestQuery query) {
        return ApiResponse.success(service.pageChangeRequests(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mdm:changerequest:list")
    public ApiResponse<SysMdmChangeRequest> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mdm:changerequest:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMdmChangeRequestSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mdm:changerequest:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMdmChangeRequestSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mdm:changerequest:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
