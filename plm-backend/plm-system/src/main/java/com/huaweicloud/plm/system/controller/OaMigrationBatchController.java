package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizMigrationBatchSaveRequest;
import com.huaweicloud.plm.system.dto.BizMigrationCleanLogSaveRequest;
import com.huaweicloud.plm.system.dto.BizMigrationCleanRuleSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationBatch;
import com.huaweicloud.plm.system.entity.OaMigrationCleanLog;
import com.huaweicloud.plm.system.entity.OaMigrationCleanRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMigrationBatchService;
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

import java.util.Map;

/**
 * 迁移批次与数据清洗接口（OA-DEV-097/098/100/101）：抽取/全量/增量试迁批次、清洗规则与清洗日志。
 */
@RestController
@RequestMapping("/oa/migration/batches")
@RequiredArgsConstructor
public class OaMigrationBatchController {

    private final OaMigrationBatchService batchService;

    // ================= 迁移批次 =================

    @GetMapping
    @RequirePermission("oa:migration:batch:list")
    public ApiResponse<PageResult<OaMigrationBatch>> page(OaMigrationQuery query) {
        return ApiResponse.success(batchService.pageBatches(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:migration:batch:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(batchService.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:migration:batch:list")
    public ApiResponse<OaMigrationBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(batchService.detailBatch(id));
    }

    @PostMapping
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizMigrationBatchSaveRequest request) {
        return ApiResponse.success(batchService.saveBatch(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody BizMigrationBatchSaveRequest request) {
        return ApiResponse.success(batchService.saveBatch(id, request));
    }

    /** 执行批次：按成功/失败/跳过数量推导批次状态。 */
    @PostMapping("/{id}/execute")
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<OaMigrationBatch> execute(@PathVariable Long id) {
        return ApiResponse.success(batchService.executeBatch(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ApiResponse.success();
    }

    // ================= 清洗规则 =================

    @GetMapping("/clean-rules")
    @RequirePermission("oa:migration:batch:list")
    public ApiResponse<PageResult<OaMigrationCleanRule>> pageCleanRules(OaMigrationQuery query) {
        return ApiResponse.success(batchService.pageCleanRules(query));
    }

    @GetMapping("/clean-rules/{id}")
    @RequirePermission("oa:migration:batch:list")
    public ApiResponse<OaMigrationCleanRule> cleanRuleDetail(@PathVariable Long id) {
        return ApiResponse.success(batchService.detailCleanRule(id));
    }

    @PostMapping("/clean-rules")
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<Long> createCleanRule(@Valid @RequestBody BizMigrationCleanRuleSaveRequest request) {
        return ApiResponse.success(batchService.saveCleanRule(null, request));
    }

    @PutMapping("/clean-rules/{id}")
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<Long> updateCleanRule(@PathVariable Long id,
                                            @Valid @RequestBody BizMigrationCleanRuleSaveRequest request) {
        return ApiResponse.success(batchService.saveCleanRule(id, request));
    }

    @DeleteMapping("/clean-rules/{id}")
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<Void> deleteCleanRule(@PathVariable Long id) {
        batchService.deleteCleanRule(id);
        return ApiResponse.success();
    }

    // ================= 清洗日志 =================

    @GetMapping("/clean-logs")
    @RequirePermission("oa:migration:batch:list")
    public ApiResponse<PageResult<OaMigrationCleanLog>> pageCleanLogs(OaMigrationQuery query) {
        return ApiResponse.success(batchService.pageCleanLogs(query));
    }

    @GetMapping("/clean-logs/{id}")
    @RequirePermission("oa:migration:batch:list")
    public ApiResponse<OaMigrationCleanLog> cleanLogDetail(@PathVariable Long id) {
        return ApiResponse.success(batchService.detailCleanLog(id));
    }

    @PostMapping("/clean-logs")
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<Long> recordCleanLog(@Valid @RequestBody BizMigrationCleanLogSaveRequest request) {
        return ApiResponse.success(batchService.recordCleanLog(request));
    }

    @DeleteMapping("/clean-logs/{id}")
    @RequirePermission("oa:migration:batch:manage")
    public ApiResponse<Void> deleteCleanLog(@PathVariable Long id) {
        batchService.deleteCleanLog(id);
        return ApiResponse.success();
    }
}
