package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigOpenBusinessBatchQuery;
import com.huaweicloud.plm.system.dto.MigOpenBusinessBatchSaveRequest;
import com.huaweicloud.plm.system.dto.MigOpenBusinessImportRequest;
import com.huaweicloud.plm.system.dto.MigOpenBusinessImportResult;
import com.huaweicloud.plm.system.dto.MigOpenBusinessImportRowQuery;
import com.huaweicloud.plm.system.dto.MigOpenBusinessReviewRequest;
import com.huaweicloud.plm.system.entity.MigOpenBusinessBatch;
import com.huaweicloud.plm.system.entity.MigOpenBusinessImportRow;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigOpenBusinessBatchService;
import com.huaweicloud.plm.system.service.MigOpenBusinessImportService;
import com.huaweicloud.plm.system.service.MigOpenBusinessPromotionService;
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
 * 同步批次接口：未结业务迁移集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/open-business/batches")
@RequiredArgsConstructor
public class MigOpenBusinessBatchController {

    private final MigOpenBusinessBatchService service;
    private final MigOpenBusinessImportService importService;
    private final MigOpenBusinessPromotionService promotionService;

    @GetMapping
    @RequirePermission("mig:open-business:batch:list")
    public ApiResponse<PageResult<MigOpenBusinessBatch>> page(MigOpenBusinessBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:open-business:batch:list")
    public ApiResponse<MigOpenBusinessBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigOpenBusinessBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigOpenBusinessBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{batchId}/rows/import")
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<MigOpenBusinessImportResult> importRows(
            @PathVariable Long batchId, @Valid @RequestBody MigOpenBusinessImportRequest request) {
        return ApiResponse.success(importService.stage(batchId, request));
    }

    @GetMapping("/{batchId}/rows")
    @RequirePermission("mig:open-business:batch:list")
    public ApiResponse<PageResult<MigOpenBusinessImportRow>> rows(
            @PathVariable Long batchId, MigOpenBusinessImportRowQuery query) {
        return ApiResponse.success(importService.page(batchId, query));
    }

    @PostMapping("/rows/{rowId}/review")
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<MigOpenBusinessImportRow> review(
            @PathVariable Long rowId, @Valid @RequestBody MigOpenBusinessReviewRequest request) {
        return ApiResponse.success(importService.review(rowId, request));
    }

    @PostMapping("/rows/{rowId}/promote")
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<MigOpenBusinessImportRow> promote(@PathVariable Long rowId) {
        return ApiResponse.success(promotionService.promote(rowId));
    }
}
