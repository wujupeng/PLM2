package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpPlanAdjustmentQuery;
import com.huaweicloud.plm.system.dto.ErpPlanAdjustmentSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPlanAdjustment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpPlanAdjustmentService;
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
 * 计划调整接口（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 计划调整登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/demand-plan/plan-adjustments")
@RequiredArgsConstructor
public class ErpPlanAdjustmentController {

    private final ErpPlanAdjustmentService service;

    @GetMapping
    @RequirePermission("erp:demand-plan:adjustment:list")
    public ApiResponse<PageResult<ErpPlanAdjustment>> page(ErpPlanAdjustmentQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:demand-plan:adjustment:list")
    public ApiResponse<ErpPlanAdjustment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:demand-plan:adjustment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpPlanAdjustmentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:demand-plan:adjustment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpPlanAdjustmentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:demand-plan:adjustment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
