package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgDocumentChainBatchQuery;
import com.huaweicloud.plm.system.dto.IntgDocumentChainBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgDocumentChainBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgDocumentChainBatchService;
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
 * 同步批次接口：单据全链路集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/document-chain/batches")
@RequiredArgsConstructor
public class IntgDocumentChainBatchController {

    private final IntgDocumentChainBatchService service;

    @GetMapping
    @RequirePermission("intg:document-chain:batch:list")
    public ApiResponse<PageResult<IntgDocumentChainBatch>> page(IntgDocumentChainBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:document-chain:batch:list")
    public ApiResponse<IntgDocumentChainBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:document-chain:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgDocumentChainBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:document-chain:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgDocumentChainBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:document-chain:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
