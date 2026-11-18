package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpMaterialIssueDetailResponse;
import com.huaweicloud.plm.system.dto.ErpMaterialIssueLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpMaterialIssueQuery;
import com.huaweicloud.plm.system.dto.ErpMaterialIssueSaveRequest;
import com.huaweicloud.plm.system.entity.ErpMaterialIssue;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpMaterialIssueService;
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
 * 材料领用单接口（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 材料领用单头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/production/material-issues")
@RequiredArgsConstructor
public class ErpMaterialIssueController {

    private final ErpMaterialIssueService service;

    @GetMapping
    @RequirePermission("erp:production:issue:list")
    public ApiResponse<PageResult<ErpMaterialIssue>> page(ErpMaterialIssueQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:production:issue:list")
    public ApiResponse<ErpMaterialIssueDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:production:issue:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpMaterialIssueSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:production:issue:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpMaterialIssueSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:production:issue:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:production:issue:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpMaterialIssueLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:production:issue:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpMaterialIssueLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:production:issue:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
