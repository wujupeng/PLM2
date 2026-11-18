package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpSrmMappingQuery;
import com.huaweicloud.plm.system.dto.IntgErpSrmMappingSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpSrmMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpSrmMappingService;
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
 * 字段映射接口：ERP→SRM 集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/erp-srm/mappings")
@RequiredArgsConstructor
public class IntgErpSrmMappingController {

    private final IntgErpSrmMappingService service;

    @GetMapping
    @RequirePermission("intg:erp-srm:mapping:list")
    public ApiResponse<PageResult<IntgErpSrmMapping>> page(IntgErpSrmMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-srm:mapping:list")
    public ApiResponse<IntgErpSrmMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-srm:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpSrmMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-srm:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpSrmMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-srm:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
