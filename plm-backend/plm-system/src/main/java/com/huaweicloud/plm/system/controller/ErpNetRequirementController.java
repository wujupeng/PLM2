package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpNetRequirementQuery;
import com.huaweicloud.plm.system.dto.ErpNetRequirementSaveRequest;
import com.huaweicloud.plm.system.entity.ErpNetRequirement;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpNetRequirementService;
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
 * 净需求接口（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 净需求登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/demand-plan/net-requirements")
@RequiredArgsConstructor
public class ErpNetRequirementController {

    private final ErpNetRequirementService service;

    @GetMapping
    @RequirePermission("erp:demand-plan:netreq:list")
    public ApiResponse<PageResult<ErpNetRequirement>> page(ErpNetRequirementQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:demand-plan:netreq:list")
    public ApiResponse<ErpNetRequirement> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:demand-plan:netreq:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpNetRequirementSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:demand-plan:netreq:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpNetRequirementSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:demand-plan:netreq:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
