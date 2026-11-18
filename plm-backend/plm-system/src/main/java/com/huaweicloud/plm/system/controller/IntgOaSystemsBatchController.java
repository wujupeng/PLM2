package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgOaSystemsBatchQuery;
import com.huaweicloud.plm.system.dto.IntgOaSystemsBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgOaSystemsBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgOaSystemsBatchService;
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
 * 同步批次接口：OA↔六系统集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/oa-systems/batches")
@RequiredArgsConstructor
public class IntgOaSystemsBatchController {

    private final IntgOaSystemsBatchService service;

    @GetMapping
    @RequirePermission("intg:oa-systems:batch:list")
    public ApiResponse<PageResult<IntgOaSystemsBatch>> page(IntgOaSystemsBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:oa-systems:batch:list")
    public ApiResponse<IntgOaSystemsBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:oa-systems:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgOaSystemsBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:oa-systems:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgOaSystemsBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:oa-systems:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
