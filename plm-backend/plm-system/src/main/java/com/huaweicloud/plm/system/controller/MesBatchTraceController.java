package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesBatchTraceQuery;
import com.huaweicloud.plm.system.dto.MesBatchTraceSaveRequest;
import com.huaweicloud.plm.system.entity.MesBatchTrace;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesBatchTraceService;
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
 * 批次追溯接口：登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/trace/batches")
@RequiredArgsConstructor
public class MesBatchTraceController {

    private final MesBatchTraceService service;

    @GetMapping
    @RequirePermission("mes:trace:batch:list")
    public ApiResponse<PageResult<MesBatchTrace>> page(MesBatchTraceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:trace:batch:list")
    public ApiResponse<MesBatchTrace> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:trace:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesBatchTraceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:trace:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesBatchTraceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:trace:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
