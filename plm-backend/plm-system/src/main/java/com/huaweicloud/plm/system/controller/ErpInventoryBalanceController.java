package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpInventoryBalanceQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryBalanceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryBalance;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpInventoryBalanceService;
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
 * 库存余额接口（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 收发存台账登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/inventory/balances")
@RequiredArgsConstructor
public class ErpInventoryBalanceController {

    private final ErpInventoryBalanceService service;

    @GetMapping
    @RequirePermission("erp:inventory:balance:list")
    public ApiResponse<PageResult<ErpInventoryBalance>> page(ErpInventoryBalanceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:inventory:balance:list")
    public ApiResponse<ErpInventoryBalance> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:inventory:balance:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpInventoryBalanceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:inventory:balance:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpInventoryBalanceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:inventory:balance:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
