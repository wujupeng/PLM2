package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmRectificationQuery;
import com.huaweicloud.plm.system.dto.SrmRectificationSaveRequest;
import com.huaweicloud.plm.system.entity.SrmRectification;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmRectificationService;
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
 * 整改跟踪接口（对应整改跟踪）：
 * 整改单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/rectifications")
@RequiredArgsConstructor
public class SrmRectificationController {

    private final SrmRectificationService service;

    @GetMapping
    @RequirePermission("srm:quality:rectification:list")
    public ApiResponse<PageResult<SrmRectification>> page(SrmRectificationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:quality:rectification:list")
    public ApiResponse<SrmRectification> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:quality:rectification:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmRectificationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:quality:rectification:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmRectificationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:quality:rectification:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
