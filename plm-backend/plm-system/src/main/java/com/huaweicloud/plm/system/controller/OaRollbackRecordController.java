package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.dto.OaRollbackRecordSaveRequest;
import com.huaweicloud.plm.system.entity.OaRollbackRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaRollbackRecordService;
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
 * 回退决策和演练接口（OA-DEV-118）：回退类型、触发条件、回退范围、决策与演练结果。
 */
@RestController
@RequestMapping("/oa/golive/rollback-records")
@RequiredArgsConstructor
public class OaRollbackRecordController {

    private final OaRollbackRecordService service;

    @GetMapping
    @RequirePermission("oa:golive:rollback:list")
    public ApiResponse<PageResult<OaRollbackRecord>> page(OaGoliveQuery query) {
        return ApiResponse.success(service.pageRecords(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:golive:rollback:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:golive:rollback:list")
    public ApiResponse<OaRollbackRecord> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:golive:rollback:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaRollbackRecordSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:golive:rollback:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaRollbackRecordSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 登记回退决策。 */
    @PostMapping("/{id}/decide")
    @RequirePermission("oa:golive:rollback:manage")
    public ApiResponse<OaRollbackRecord> decide(@PathVariable Long id,
                                                @RequestParam(required = false) String decisionResult) {
        return ApiResponse.success(service.decide(id, decisionResult));
    }

    /** 登记回退演练。 */
    @PostMapping("/{id}/drill")
    @RequirePermission("oa:golive:rollback:manage")
    public ApiResponse<OaRollbackRecord> drill(@PathVariable Long id,
                                               @RequestParam(required = false) String drillResult) {
        return ApiResponse.success(service.drill(id, drillResult));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:golive:rollback:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
