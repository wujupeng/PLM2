package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgLabelTraceBatchQuery;
import com.huaweicloud.plm.system.dto.IntgLabelTraceBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgLabelTraceBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgLabelTraceBatchService;
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
 * 同步批次接口：标签追溯集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/label-trace/batches")
@RequiredArgsConstructor
public class IntgLabelTraceBatchController {

    private final IntgLabelTraceBatchService service;

    @GetMapping
    @RequirePermission("intg:label-trace:batch:list")
    public ApiResponse<PageResult<IntgLabelTraceBatch>> page(IntgLabelTraceBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:label-trace:batch:list")
    public ApiResponse<IntgLabelTraceBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:label-trace:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgLabelTraceBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:label-trace:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgLabelTraceBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:label-trace:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
