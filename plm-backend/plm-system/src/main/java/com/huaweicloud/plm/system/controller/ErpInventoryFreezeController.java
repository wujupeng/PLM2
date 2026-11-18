package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpInventoryFreezeQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryFreezeSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryFreeze;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpInventoryFreezeService;
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
 * 库存冻结单接口（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存冻结登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/inventory/freezes")
@RequiredArgsConstructor
public class ErpInventoryFreezeController {

    private final ErpInventoryFreezeService service;

    @GetMapping
    @RequirePermission("erp:inventory:freeze:list")
    public ApiResponse<PageResult<ErpInventoryFreeze>> page(ErpInventoryFreezeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:inventory:freeze:list")
    public ApiResponse<ErpInventoryFreeze> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:inventory:freeze:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpInventoryFreezeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:inventory:freeze:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpInventoryFreezeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:inventory:freeze:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
