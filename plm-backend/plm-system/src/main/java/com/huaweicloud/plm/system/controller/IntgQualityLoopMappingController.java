package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgQualityLoopMappingQuery;
import com.huaweicloud.plm.system.dto.IntgQualityLoopMappingSaveRequest;
import com.huaweicloud.plm.system.entity.IntgQualityLoopMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgQualityLoopMappingService;
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
 * 字段映射接口：质量闭环集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/quality-loop/mappings")
@RequiredArgsConstructor
public class IntgQualityLoopMappingController {

    private final IntgQualityLoopMappingService service;

    @GetMapping
    @RequirePermission("intg:quality-loop:mapping:list")
    public ApiResponse<PageResult<IntgQualityLoopMapping>> page(IntgQualityLoopMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:quality-loop:mapping:list")
    public ApiResponse<IntgQualityLoopMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:quality-loop:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgQualityLoopMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:quality-loop:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgQualityLoopMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:quality-loop:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
