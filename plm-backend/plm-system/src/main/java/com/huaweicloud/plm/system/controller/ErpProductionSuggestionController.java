package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProductionSuggestionQuery;
import com.huaweicloud.plm.system.dto.ErpProductionSuggestionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProductionSuggestion;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProductionSuggestionService;
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
 * 生产建议接口（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 生产建议登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/demand-plan/production-suggestions")
@RequiredArgsConstructor
public class ErpProductionSuggestionController {

    private final ErpProductionSuggestionService service;

    @GetMapping
    @RequirePermission("erp:demand-plan:productionsuggestion:list")
    public ApiResponse<PageResult<ErpProductionSuggestion>> page(ErpProductionSuggestionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:demand-plan:productionsuggestion:list")
    public ApiResponse<ErpProductionSuggestion> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:demand-plan:productionsuggestion:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProductionSuggestionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:demand-plan:productionsuggestion:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpProductionSuggestionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:demand-plan:productionsuggestion:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
