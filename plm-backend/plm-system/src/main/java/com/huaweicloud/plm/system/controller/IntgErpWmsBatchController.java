package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpWmsBatchQuery;
import com.huaweicloud.plm.system.dto.IntgErpWmsBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpWmsBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpWmsBatchService;
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
 * 同步批次接口：ERP↔WMS 集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/erp-wms/batches")
@RequiredArgsConstructor
public class IntgErpWmsBatchController {

    private final IntgErpWmsBatchService service;

    @GetMapping
    @RequirePermission("intg:erp-wms:batch:list")
    public ApiResponse<PageResult<IntgErpWmsBatch>> page(IntgErpWmsBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-wms:batch:list")
    public ApiResponse<IntgErpWmsBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-wms:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpWmsBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-wms:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpWmsBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-wms:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
