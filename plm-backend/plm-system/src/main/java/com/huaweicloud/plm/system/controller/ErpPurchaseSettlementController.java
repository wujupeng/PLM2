package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpPurchaseSettlementQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseSettlementSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseSettlement;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpPurchaseSettlementService;
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
 * 采购结算接口（G3-N3a ERP 采购管理）：
 * 采购结算单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/purchase/settlements")
@RequiredArgsConstructor
public class ErpPurchaseSettlementController {

    private final ErpPurchaseSettlementService service;

    @GetMapping
    @RequirePermission("erp:purchase:settlement:list")
    public ApiResponse<PageResult<ErpPurchaseSettlement>> page(ErpPurchaseSettlementQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:purchase:settlement:list")
    public ApiResponse<ErpPurchaseSettlement> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:purchase:settlement:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpPurchaseSettlementSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:purchase:settlement:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpPurchaseSettlementSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:purchase:settlement:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
