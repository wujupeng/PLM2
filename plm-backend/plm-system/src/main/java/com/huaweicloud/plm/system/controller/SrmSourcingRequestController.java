package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmSourcingRequestQuery;
import com.huaweicloud.plm.system.dto.SrmSourcingRequestSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSourcingRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmSourcingRequestService;
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
 * 采购需求寻源接口（对应采购需求寻源）：
 * 寻源需求登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/sourcing-requests")
@RequiredArgsConstructor
public class SrmSourcingRequestController {

    private final SrmSourcingRequestService service;

    @GetMapping
    @RequirePermission("srm:sourcing:request:list")
    public ApiResponse<PageResult<SrmSourcingRequest>> page(SrmSourcingRequestQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:sourcing:request:list")
    public ApiResponse<SrmSourcingRequest> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:sourcing:request:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmSourcingRequestSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:sourcing:request:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmSourcingRequestSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:sourcing:request:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
