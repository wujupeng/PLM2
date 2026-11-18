package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpInventoryTransactionQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryTransactionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryTransaction;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpInventoryTransactionService;
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
 * 库存流水接口（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 出入库明细登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/inventory/transactions")
@RequiredArgsConstructor
public class ErpInventoryTransactionController {

    private final ErpInventoryTransactionService service;

    @GetMapping
    @RequirePermission("erp:inventory:transaction:list")
    public ApiResponse<PageResult<ErpInventoryTransaction>> page(ErpInventoryTransactionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:inventory:transaction:list")
    public ApiResponse<ErpInventoryTransaction> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:inventory:transaction:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpInventoryTransactionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:inventory:transaction:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpInventoryTransactionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:inventory:transaction:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
