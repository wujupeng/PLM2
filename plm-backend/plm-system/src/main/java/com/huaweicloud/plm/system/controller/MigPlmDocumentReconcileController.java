package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigPlmDocumentReconcileQuery;
import com.huaweicloud.plm.system.dto.MigPlmDocumentReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.MigPlmDocumentReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigPlmDocumentReconcileService;
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
 * PLM文档迁移对账接口：PLM文档迁移集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/plm-document/reconciles")
@RequiredArgsConstructor
public class MigPlmDocumentReconcileController {

    private final MigPlmDocumentReconcileService service;

    @GetMapping
    @RequirePermission("mig:plm-document:reconcile:list")
    public ApiResponse<PageResult<MigPlmDocumentReconcile>> page(MigPlmDocumentReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:plm-document:reconcile:list")
    public ApiResponse<MigPlmDocumentReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:plm-document:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigPlmDocumentReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:plm-document:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigPlmDocumentReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:plm-document:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
