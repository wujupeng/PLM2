package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmErpMappingQuery;
import com.huaweicloud.plm.system.dto.IntgPlmErpMappingSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmErpMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmErpMappingService;
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
 * 字段映射接口：PLM→ERP 集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-erp/mappings")
@RequiredArgsConstructor
public class IntgPlmErpMappingController {

    private final IntgPlmErpMappingService service;

    @GetMapping
    @RequirePermission("intg:plm-erp:mapping:list")
    public ApiResponse<PageResult<IntgPlmErpMapping>> page(IntgPlmErpMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-erp:mapping:list")
    public ApiResponse<IntgPlmErpMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-erp:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmErpMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-erp:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmErpMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-erp:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
