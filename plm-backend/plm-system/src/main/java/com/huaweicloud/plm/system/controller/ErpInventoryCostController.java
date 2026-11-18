package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpInventoryCostQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryCostSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryCost;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpInventoryCostService;
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
 * 库存成本核算单接口（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存成本核算登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/inventory/costs")
@RequiredArgsConstructor
public class ErpInventoryCostController {

    private final ErpInventoryCostService service;

    @GetMapping
    @RequirePermission("erp:inventory:cost:list")
    public ApiResponse<PageResult<ErpInventoryCost>> page(ErpInventoryCostQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:inventory:cost:list")
    public ApiResponse<ErpInventoryCost> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:inventory:cost:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpInventoryCostSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:inventory:cost:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpInventoryCostSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:inventory:cost:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
