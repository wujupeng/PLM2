package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsPlanApproveRequest;
import com.huaweicloud.plm.system.dto.WmsPlanQuery;
import com.huaweicloud.plm.system.dto.WmsPlanSaveRequest;
import com.huaweicloud.plm.system.entity.WmsContingencyPlan;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsContingencyPlanService;
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
 * 应急预案接口（N7，DEV-084）。
 */
@RestController
@RequestMapping("/wms/plans")
@RequiredArgsConstructor
public class WmsContingencyController {

    private final WmsContingencyPlanService wmsContingencyPlanService;

    @GetMapping
    @RequirePermission("wms:plan:list")
    public ApiResponse<PageResult<WmsContingencyPlan>> page(WmsPlanQuery query) {
        return ApiResponse.success(wmsContingencyPlanService.page(query));
    }

    @GetMapping("/{planNo}")
    @RequirePermission("wms:plan:list")
    public ApiResponse<WmsContingencyPlan> detail(@PathVariable String planNo) {
        return ApiResponse.success(wmsContingencyPlanService.requirePlan(planNo));
    }

    @PostMapping
    @RequirePermission("wms:plan:save")
    public ApiResponse<Long> create(@Valid @RequestBody WmsPlanSaveRequest request) {
        return ApiResponse.success(wmsContingencyPlanService.create(request));
    }

    @PutMapping("/{planNo}")
    @RequirePermission("wms:plan:save")
    public ApiResponse<Void> update(@PathVariable String planNo,
                                    @Valid @RequestBody WmsPlanSaveRequest request) {
        wmsContingencyPlanService.update(planNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{planNo}")
    @RequirePermission("wms:plan:save")
    public ApiResponse<Void> delete(@PathVariable String planNo) {
        wmsContingencyPlanService.delete(planNo);
        return ApiResponse.success();
    }

    @PostMapping("/{planNo}/approve")
    @RequirePermission("wms:plan:approve")
    public ApiResponse<Void> approve(@PathVariable String planNo,
                                     @RequestBody(required = false) WmsPlanApproveRequest request) {
        wmsContingencyPlanService.approve(planNo, request);
        return ApiResponse.success();
    }

    @PostMapping("/{planNo}/execute")
    @RequirePermission("wms:plan:save")
    public ApiResponse<Void> execute(@PathVariable String planNo) {
        wmsContingencyPlanService.execute(planNo);
        return ApiResponse.success();
    }

    @PostMapping("/{planNo}/cancel")
    @RequirePermission("wms:plan:save")
    public ApiResponse<Void> cancel(@PathVariable String planNo) {
        wmsContingencyPlanService.cancel(planNo);
        return ApiResponse.success();
    }
}
