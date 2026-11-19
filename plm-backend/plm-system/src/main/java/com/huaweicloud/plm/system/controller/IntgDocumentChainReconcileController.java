package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgDocumentChainReconcileQuery;
import com.huaweicloud.plm.system.dto.IntgDocumentChainReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.IntgDocumentChainReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgDocumentChainReconcileService;
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
 * 单据全链路对账接口：单据全链路集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/document-chain/reconciles")
@RequiredArgsConstructor
public class IntgDocumentChainReconcileController {

    private final IntgDocumentChainReconcileService service;

    @GetMapping
    @RequirePermission("intg:document-chain:reconcile:list")
    public ApiResponse<PageResult<IntgDocumentChainReconcile>> page(IntgDocumentChainReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:document-chain:reconcile:list")
    public ApiResponse<IntgDocumentChainReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:document-chain:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgDocumentChainReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:document-chain:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgDocumentChainReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:document-chain:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
