package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgQualityLoopBatchQuery;
import com.huaweicloud.plm.system.dto.IntgQualityLoopBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgQualityLoopBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgQualityLoopBatchService;
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
 * 同步批次接口：质量闭环集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/quality-loop/batches")
@RequiredArgsConstructor
public class IntgQualityLoopBatchController {

    private final IntgQualityLoopBatchService service;

    @GetMapping
    @RequirePermission("intg:quality-loop:batch:list")
    public ApiResponse<PageResult<IntgQualityLoopBatch>> page(IntgQualityLoopBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:quality-loop:batch:list")
    public ApiResponse<IntgQualityLoopBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:quality-loop:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgQualityLoopBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:quality-loop:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgQualityLoopBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:quality-loop:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
