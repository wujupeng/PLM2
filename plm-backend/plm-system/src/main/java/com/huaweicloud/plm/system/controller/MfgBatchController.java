package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MfgBatchQuery;
import com.huaweicloud.plm.system.dto.MfgBatchSaveRequest;
import com.huaweicloud.plm.system.entity.MfgProductionBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MfgBatchService;
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
 * 生产批次档案接口（N8，DEV-085）：关联工单、产品、BOM/工艺版本与生产现场信息。
 */
@RestController
@RequestMapping("/mfg/batches")
@RequiredArgsConstructor
public class MfgBatchController {

    private final MfgBatchService mfgBatchService;

    @GetMapping
    @RequirePermission("mfg:batch:list")
    public ApiResponse<PageResult<MfgProductionBatch>> page(MfgBatchQuery query) {
        return ApiResponse.success(mfgBatchService.page(query));
    }

    @GetMapping("/{batchNo}")
    @RequirePermission("mfg:batch:list")
    public ApiResponse<MfgProductionBatch> detail(@PathVariable String batchNo) {
        return ApiResponse.success(mfgBatchService.requireBatch(batchNo));
    }

    @PostMapping
    @RequirePermission("mfg:batch:save")
    public ApiResponse<String> create(@Valid @RequestBody MfgBatchSaveRequest request) {
        mfgBatchService.create(request);
        return ApiResponse.success(request.getBatchNo());
    }

    @PutMapping("/{batchNo}")
    @RequirePermission("mfg:batch:save")
    public ApiResponse<Void> update(@PathVariable String batchNo,
                                    @Valid @RequestBody MfgBatchSaveRequest request) {
        mfgBatchService.update(batchNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{batchNo}")
    @RequirePermission("mfg:batch:save")
    public ApiResponse<Void> delete(@PathVariable String batchNo) {
        mfgBatchService.delete(batchNo);
        return ApiResponse.success();
    }
}
