package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizMigrationDualRunSaveRequest;
import com.huaweicloud.plm.system.dto.BizMigrationReconcileSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationDualRun;
import com.huaweicloud.plm.system.entity.OaMigrationReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMigrationReconcileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 迁移对账与双跑对照接口（OA-DEV-103/104）：对账差异统计与结论确认、新旧流程双跑对照。
 */
@RestController
@RequestMapping("/oa/migration/reconciles")
@RequiredArgsConstructor
public class OaMigrationReconcileController {

    private final OaMigrationReconcileService reconcileService;

    // ================= 迁移对账 =================

    @GetMapping
    @RequirePermission("oa:migration:reconcile:list")
    public ApiResponse<PageResult<OaMigrationReconcile>> page(OaMigrationQuery query) {
        return ApiResponse.success(reconcileService.pageReconciles(query));
    }

    /** 对账汇总报告：按对象输出统计与结论。 */
    @GetMapping("/report")
    @RequirePermission("oa:migration:reconcile:list")
    public ApiResponse<Map<String, Object>> report() {
        return ApiResponse.success(reconcileService.reconcileReport());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:migration:reconcile:list")
    public ApiResponse<OaMigrationReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(reconcileService.detailReconcile(id));
    }

    @PostMapping
    @RequirePermission("oa:migration:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizMigrationReconcileSaveRequest request) {
        return ApiResponse.success(reconcileService.saveReconcile(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:migration:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id,
                                    @Valid @RequestBody BizMigrationReconcileSaveRequest request) {
        return ApiResponse.success(reconcileService.saveReconcile(id, request));
    }

    /** 业务方确认对账结论。 */
    @PostMapping("/{id}/confirm")
    @RequirePermission("oa:migration:reconcile:manage")
    public ApiResponse<OaMigrationReconcile> confirm(@PathVariable Long id,
                                                     @RequestParam(required = false) String conclusion) {
        return ApiResponse.success(reconcileService.confirmReconcile(id, conclusion));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:migration:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        reconcileService.deleteReconcile(id);
        return ApiResponse.success();
    }

    // ================= 双跑对照 =================

    @GetMapping("/dual-runs")
    @RequirePermission("oa:migration:dual:list")
    public ApiResponse<PageResult<OaMigrationDualRun>> pageDualRuns(OaMigrationQuery query) {
        return ApiResponse.success(reconcileService.pageDualRuns(query));
    }

    /** 双跑对照汇总。 */
    @GetMapping("/dual-runs/summary")
    @RequirePermission("oa:migration:dual:list")
    public ApiResponse<Map<String, Object>> dualRunSummary() {
        return ApiResponse.success(reconcileService.dualRunSummary());
    }

    @GetMapping("/dual-runs/{id}")
    @RequirePermission("oa:migration:dual:list")
    public ApiResponse<OaMigrationDualRun> dualRunDetail(@PathVariable Long id) {
        return ApiResponse.success(reconcileService.detailDualRun(id));
    }

    @PostMapping("/dual-runs")
    @RequirePermission("oa:migration:dual:manage")
    public ApiResponse<Long> createDualRun(@Valid @RequestBody BizMigrationDualRunSaveRequest request) {
        return ApiResponse.success(reconcileService.saveDualRun(null, request));
    }

    @PutMapping("/dual-runs/{id}")
    @RequirePermission("oa:migration:dual:manage")
    public ApiResponse<Long> updateDualRun(@PathVariable Long id,
                                           @Valid @RequestBody BizMigrationDualRunSaveRequest request) {
        return ApiResponse.success(reconcileService.saveDualRun(id, request));
    }

    /** 重新比对新旧流程差异项。 */
    @PostMapping("/dual-runs/{id}/compare")
    @RequirePermission("oa:migration:dual:manage")
    public ApiResponse<OaMigrationDualRun> compareDualRun(@PathVariable Long id) {
        return ApiResponse.success(reconcileService.compareDualRun(id));
    }

    @DeleteMapping("/dual-runs/{id}")
    @RequirePermission("oa:migration:dual:manage")
    public ApiResponse<Void> deleteDualRun(@PathVariable Long id) {
        reconcileService.deleteDualRun(id);
        return ApiResponse.success();
    }
}
