package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmDeliveryCommitmentQuery;
import com.huaweicloud.plm.system.dto.SrmDeliveryCommitmentSaveRequest;
import com.huaweicloud.plm.system.entity.SrmDeliveryCommitment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmDeliveryCommitmentService;
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
 * 交期承诺接口（对应交期承诺）：
 * 交期承诺登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/commitments")
@RequiredArgsConstructor
public class SrmDeliveryCommitmentController {

    private final SrmDeliveryCommitmentService service;

    @GetMapping
    @RequirePermission("srm:collab:commitment:list")
    public ApiResponse<PageResult<SrmDeliveryCommitment>> page(SrmDeliveryCommitmentQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:collab:commitment:list")
    public ApiResponse<SrmDeliveryCommitment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:collab:commitment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmDeliveryCommitmentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:collab:commitment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmDeliveryCommitmentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:collab:commitment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
