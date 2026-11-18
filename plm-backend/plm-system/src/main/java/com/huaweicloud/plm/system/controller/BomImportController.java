package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BomBatchQuery;
import com.huaweicloud.plm.system.dto.BomImportRequest;
import com.huaweicloud.plm.system.dto.BomImportResult;
import com.huaweicloud.plm.system.entity.BomImportBatch;
import com.huaweicloud.plm.system.entity.BomImportError;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.BomImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * BOM 单阶导入接口（DEV-025）。
 */
@RestController
@RequestMapping("/bom/imports")
@RequiredArgsConstructor
public class BomImportController {

    private final BomImportService bomImportService;

    @PostMapping
    @RequirePermission("bom:import")
    public ApiResponse<BomImportResult> importBom(@Valid @RequestBody BomImportRequest request) {
        return ApiResponse.success(bomImportService.importBom(request));
    }

    @GetMapping("/batches")
    @RequirePermission("bom:list")
    public ApiResponse<PageResult<BomImportBatch>> batches(BomBatchQuery query) {
        return ApiResponse.success(bomImportService.page(query));
    }

    @GetMapping("/batches/{batchId}")
    @RequirePermission("bom:list")
    public ApiResponse<BomImportBatch> batch(@PathVariable Long batchId) {
        return ApiResponse.success(bomImportService.getBatch(batchId));
    }

    @GetMapping("/batches/{batchId}/errors")
    @RequirePermission("bom:list")
    public ApiResponse<List<BomImportError>> errors(@PathVariable Long batchId) {
        return ApiResponse.success(bomImportService.listErrors(batchId));
    }
}
