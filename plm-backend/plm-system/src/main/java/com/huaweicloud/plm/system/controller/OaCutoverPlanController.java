package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaCutoverPlanSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaCutoverPlan;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaCutoverPlanService;
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
 * 上线切换与回退预案接口（OA-DEV-113）：切换窗口、冻结时间、增量同步、入口切换、通知方案与回退预案。
 */
@RestController
@RequestMapping("/oa/test/cutover-plans")
@RequiredArgsConstructor
public class OaCutoverPlanController {

    private final OaCutoverPlanService service;

    @GetMapping
    @RequirePermission("oa:test:cutover:list")
    public ApiResponse<PageResult<OaCutoverPlan>> page(OaTestQuery query) {
        return ApiResponse.success(service.pageCutoverPlans(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:cutover:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:cutover:list")
    public ApiResponse<OaCutoverPlan> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:test:cutover:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaCutoverPlanSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:cutover:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaCutoverPlanSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:cutover:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    /** 登记演练结果。 */
    @PostMapping("/{id}/rehearse")
    @RequirePermission("oa:test:cutover:manage")
    public ApiResponse<OaCutoverPlan> rehearse(@PathVariable Long id,
                                               @RequestParam(required = false) String rehearsalResult) {
        return ApiResponse.success(service.rehearse(id, rehearsalResult));
    }

    /** 批准预案。 */
    @PostMapping("/{id}/approve")
    @RequirePermission("oa:test:cutover:manage")
    public ApiResponse<OaCutoverPlan> approve(@PathVariable Long id,
                                              @RequestParam(required = false) String approver) {
        return ApiResponse.success(service.approve(id, approver));
    }
}
