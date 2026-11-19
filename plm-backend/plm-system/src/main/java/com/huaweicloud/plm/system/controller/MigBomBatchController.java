package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigBomBatchQuery;
import com.huaweicloud.plm.system.dto.MigBomBatchSaveRequest;
import com.huaweicloud.plm.system.entity.MigBomBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigBomBatchService;
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
 * 同步批次接口：BOM迁移集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/bom/batches")
@RequiredArgsConstructor
public class MigBomBatchController {

    private final MigBomBatchService service;

    @GetMapping
    @RequirePermission("mig:bom:batch:list")
    public ApiResponse<PageResult<MigBomBatch>> page(MigBomBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:bom:batch:list")
    public ApiResponse<MigBomBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:bom:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigBomBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:bom:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigBomBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:bom:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
