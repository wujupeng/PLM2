package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgSrmErpMappingQuery;
import com.huaweicloud.plm.system.dto.IntgSrmErpMappingSaveRequest;
import com.huaweicloud.plm.system.entity.IntgSrmErpMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgSrmErpMappingService;
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
 * 字段映射接口：SRM→ERP 集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/srm-erp/mappings")
@RequiredArgsConstructor
public class IntgSrmErpMappingController {

    private final IntgSrmErpMappingService service;

    @GetMapping
    @RequirePermission("intg:srm-erp:mapping:list")
    public ApiResponse<PageResult<IntgSrmErpMapping>> page(IntgSrmErpMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:srm-erp:mapping:list")
    public ApiResponse<IntgSrmErpMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:srm-erp:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgSrmErpMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:srm-erp:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgSrmErpMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:srm-erp:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
