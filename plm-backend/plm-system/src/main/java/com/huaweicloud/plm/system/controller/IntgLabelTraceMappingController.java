package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgLabelTraceMappingQuery;
import com.huaweicloud.plm.system.dto.IntgLabelTraceMappingSaveRequest;
import com.huaweicloud.plm.system.entity.IntgLabelTraceMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgLabelTraceMappingService;
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
 * 字段映射接口：标签追溯集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/label-trace/mappings")
@RequiredArgsConstructor
public class IntgLabelTraceMappingController {

    private final IntgLabelTraceMappingService service;

    @GetMapping
    @RequirePermission("intg:label-trace:mapping:list")
    public ApiResponse<PageResult<IntgLabelTraceMapping>> page(IntgLabelTraceMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:label-trace:mapping:list")
    public ApiResponse<IntgLabelTraceMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:label-trace:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgLabelTraceMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:label-trace:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgLabelTraceMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:label-trace:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
