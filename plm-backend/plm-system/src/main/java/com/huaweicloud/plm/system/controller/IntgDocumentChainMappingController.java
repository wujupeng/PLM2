package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgDocumentChainMappingQuery;
import com.huaweicloud.plm.system.dto.IntgDocumentChainMappingSaveRequest;
import com.huaweicloud.plm.system.entity.IntgDocumentChainMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgDocumentChainMappingService;
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
 * 字段映射接口：单据全链路集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/document-chain/mappings")
@RequiredArgsConstructor
public class IntgDocumentChainMappingController {

    private final IntgDocumentChainMappingService service;

    @GetMapping
    @RequirePermission("intg:document-chain:mapping:list")
    public ApiResponse<PageResult<IntgDocumentChainMapping>> page(IntgDocumentChainMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:document-chain:mapping:list")
    public ApiResponse<IntgDocumentChainMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:document-chain:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgDocumentChainMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:document-chain:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgDocumentChainMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:document-chain:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
