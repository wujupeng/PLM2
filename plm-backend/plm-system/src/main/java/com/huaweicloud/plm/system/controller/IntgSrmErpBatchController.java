package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgSrmErpBatchQuery;
import com.huaweicloud.plm.system.dto.IntgSrmErpBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgSrmErpBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgSrmErpBatchService;
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
 * 同步批次接口：SRM→ERP 集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/srm-erp/batches")
@RequiredArgsConstructor
public class IntgSrmErpBatchController {

    private final IntgSrmErpBatchService service;

    @GetMapping
    @RequirePermission("intg:srm-erp:batch:list")
    public ApiResponse<PageResult<IntgSrmErpBatch>> page(IntgSrmErpBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:srm-erp:batch:list")
    public ApiResponse<IntgSrmErpBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:srm-erp:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgSrmErpBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:srm-erp:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgSrmErpBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:srm-erp:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
