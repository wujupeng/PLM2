package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizMigrationHistoryFlowSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationHistoryFlow;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMigrationHistoryFlowService;
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

import java.util.List;
import java.util.Map;

/**
 * 历史流程只读档案接口（OA-DEV-102）：已完结/终止流程的快照与审批留痕查询。
 */
@RestController
@RequestMapping("/oa/migration/history-flows")
@RequiredArgsConstructor
public class OaMigrationHistoryFlowController {

    private final OaMigrationHistoryFlowService historyFlowService;

    @GetMapping
    @RequirePermission("oa:migration:history:list")
    public ApiResponse<PageResult<OaMigrationHistoryFlow>> page(OaMigrationQuery query) {
        return ApiResponse.success(historyFlowService.page(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:migration:history:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(historyFlowService.stats());
    }

    /** 按原单号检索历史流程档案。 */
    @GetMapping("/by-source-no")
    @RequirePermission("oa:migration:history:list")
    public ApiResponse<List<OaMigrationHistoryFlow>> bySourceNo(@RequestParam String sourceInstanceNo) {
        return ApiResponse.success(historyFlowService.queryBySourceNo(sourceInstanceNo));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:migration:history:list")
    public ApiResponse<OaMigrationHistoryFlow> detail(@PathVariable Long id) {
        return ApiResponse.success(historyFlowService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:migration:history:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizMigrationHistoryFlowSaveRequest request) {
        return ApiResponse.success(historyFlowService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:migration:history:manage")
    public ApiResponse<Long> update(@PathVariable Long id,
                                    @Valid @RequestBody BizMigrationHistoryFlowSaveRequest request) {
        return ApiResponse.success(historyFlowService.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:migration:history:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        historyFlowService.delete(id);
        return ApiResponse.success();
    }
}
