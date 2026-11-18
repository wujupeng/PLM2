package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProcessPlanQuery;
import com.huaweicloud.plm.system.dto.ErpProcessPlanSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessPlan;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProcessPlanService;
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
 * 工序计划接口（对应 G3-N7b ERP 工艺资源）：
 * 工序计划登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/process/plans")
@RequiredArgsConstructor
public class ErpProcessPlanController {

    private final ErpProcessPlanService service;

    @GetMapping
    @RequirePermission("erp:process:plan:list")
    public ApiResponse<PageResult<ErpProcessPlan>> page(ErpProcessPlanQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:process:plan:list")
    public ApiResponse<ErpProcessPlan> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:process:plan:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProcessPlanSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:process:plan:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpProcessPlanSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:process:plan:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
