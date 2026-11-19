package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgEdiGatewayBatchQuery;
import com.huaweicloud.plm.system.dto.IntgEdiGatewayBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgEdiGatewayBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgEdiGatewayBatchService;
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
 * 同步批次接口：EDI 网关集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/edi-gateway/batches")
@RequiredArgsConstructor
public class IntgEdiGatewayBatchController {

    private final IntgEdiGatewayBatchService service;

    @GetMapping
    @RequirePermission("intg:edi-gateway:batch:list")
    public ApiResponse<PageResult<IntgEdiGatewayBatch>> page(IntgEdiGatewayBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:edi-gateway:batch:list")
    public ApiResponse<IntgEdiGatewayBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:edi-gateway:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgEdiGatewayBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:edi-gateway:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgEdiGatewayBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:edi-gateway:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
