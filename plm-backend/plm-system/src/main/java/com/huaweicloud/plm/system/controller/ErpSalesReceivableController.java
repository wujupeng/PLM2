package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpSalesReceivableQuery;
import com.huaweicloud.plm.system.dto.ErpSalesReceivableSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesReceivable;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpSalesReceivableService;
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
 * 应收账款接口（G3-N2 ERP 销售管理）：
 * 应收单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/sales/receivables")
@RequiredArgsConstructor
public class ErpSalesReceivableController {

    private final ErpSalesReceivableService service;

    @GetMapping
    @RequirePermission("erp:sales:receivable:list")
    public ApiResponse<PageResult<ErpSalesReceivable>> page(ErpSalesReceivableQuery query) {
        return ApiResponse.success(service.pageReceivables(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:receivable:list")
    public ApiResponse<ErpSalesReceivable> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:receivable:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpSalesReceivableSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:receivable:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpSalesReceivableSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:receivable:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
