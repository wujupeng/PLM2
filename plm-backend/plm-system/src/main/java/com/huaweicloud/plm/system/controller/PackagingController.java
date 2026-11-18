package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SpecPackagingQuery;
import com.huaweicloud.plm.system.dto.SpecPackagingSaveRequest;
import com.huaweicloud.plm.system.entity.SpecPackaging;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.PackagingService;
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

import java.util.List;

/**
 * 包装与标签技术要求接口（DEV-046）。
 */
@RestController
@RequestMapping("/packaging/specs")
@RequiredArgsConstructor
public class PackagingController {

    private final PackagingService packagingService;

    @GetMapping
    @RequirePermission("packaging:list")
    public ApiResponse<PageResult<SpecPackaging>> page(SpecPackagingQuery query) {
        return ApiResponse.success(packagingService.page(query));
    }

    @GetMapping("/{packagingId}")
    @RequirePermission("packaging:list")
    public ApiResponse<SpecPackaging> getById(@PathVariable Long packagingId) {
        return ApiResponse.success(packagingService.getById(packagingId));
    }

    @GetMapping("/by-product/{productCode}")
    @RequirePermission("packaging:list")
    public ApiResponse<List<SpecPackaging>> listByProduct(@PathVariable String productCode) {
        return ApiResponse.success(packagingService.listByProduct(productCode));
    }

    @PostMapping
    @RequirePermission("packaging:create")
    public ApiResponse<Long> create(@Valid @RequestBody SpecPackagingSaveRequest request) {
        return ApiResponse.success(packagingService.create(request));
    }

    @PutMapping("/{packagingId}")
    @RequirePermission("packaging:update")
    public ApiResponse<Void> update(@PathVariable Long packagingId,
                                    @Valid @RequestBody SpecPackagingSaveRequest request) {
        packagingService.update(packagingId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{packagingId}")
    @RequirePermission("packaging:delete")
    public ApiResponse<Void> delete(@PathVariable Long packagingId) {
        packagingService.delete(packagingId);
        return ApiResponse.success();
    }

    @PostMapping("/{packagingId}/release")
    @RequirePermission("packaging:update")
    public ApiResponse<Void> release(@PathVariable Long packagingId) {
        packagingService.release(packagingId);
        return ApiResponse.success();
    }
}
