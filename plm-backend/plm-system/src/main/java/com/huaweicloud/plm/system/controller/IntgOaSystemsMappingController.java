package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgOaSystemsMappingQuery;
import com.huaweicloud.plm.system.dto.IntgOaSystemsMappingSaveRequest;
import com.huaweicloud.plm.system.entity.IntgOaSystemsMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgOaSystemsMappingService;
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
 * 字段映射接口：OA↔六系统集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/oa-systems/mappings")
@RequiredArgsConstructor
public class IntgOaSystemsMappingController {

    private final IntgOaSystemsMappingService service;

    @GetMapping
    @RequirePermission("intg:oa-systems:mapping:list")
    public ApiResponse<PageResult<IntgOaSystemsMapping>> page(IntgOaSystemsMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:oa-systems:mapping:list")
    public ApiResponse<IntgOaSystemsMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:oa-systems:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgOaSystemsMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:oa-systems:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgOaSystemsMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:oa-systems:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
