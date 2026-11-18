package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpDemandPlanDetailResponse;
import com.huaweicloud.plm.system.dto.ErpDemandPlanLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpDemandPlanQuery;
import com.huaweicloud.plm.system.dto.ErpDemandPlanSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDemandPlan;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpDemandPlanService;
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
 * 需求计划接口（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 需求计划头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/demand-plan/plans")
@RequiredArgsConstructor
public class ErpDemandPlanController {

    private final ErpDemandPlanService service;

    @GetMapping
    @RequirePermission("erp:demand-plan:plan:list")
    public ApiResponse<PageResult<ErpDemandPlan>> page(ErpDemandPlanQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:demand-plan:plan:list")
    public ApiResponse<ErpDemandPlanDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:demand-plan:plan:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpDemandPlanSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:demand-plan:plan:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpDemandPlanSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:demand-plan:plan:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:demand-plan:plan:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpDemandPlanLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:demand-plan:plan:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpDemandPlanLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:demand-plan:plan:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
