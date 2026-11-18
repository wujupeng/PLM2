package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpMrpRunQuery;
import com.huaweicloud.plm.system.dto.ErpMrpRunSaveRequest;
import com.huaweicloud.plm.system.entity.ErpMrpRun;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpMrpRunService;
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
 * MRP/LRP 运算批次接口（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 运算批次登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/demand-plan/mrp-runs")
@RequiredArgsConstructor
public class ErpMrpRunController {

    private final ErpMrpRunService service;

    @GetMapping
    @RequirePermission("erp:demand-plan:mrprun:list")
    public ApiResponse<PageResult<ErpMrpRun>> page(ErpMrpRunQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:demand-plan:mrprun:list")
    public ApiResponse<ErpMrpRun> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:demand-plan:mrprun:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpMrpRunSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:demand-plan:mrprun:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpMrpRunSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:demand-plan:mrprun:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
