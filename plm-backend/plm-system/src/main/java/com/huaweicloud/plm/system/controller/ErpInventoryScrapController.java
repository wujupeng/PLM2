package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpInventoryScrapQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryScrapSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryScrap;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpInventoryScrapService;
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
 * 库存报废单接口（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存报废登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/inventory/scraps")
@RequiredArgsConstructor
public class ErpInventoryScrapController {

    private final ErpInventoryScrapService service;

    @GetMapping
    @RequirePermission("erp:inventory:scrap:list")
    public ApiResponse<PageResult<ErpInventoryScrap>> page(ErpInventoryScrapQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:inventory:scrap:list")
    public ApiResponse<ErpInventoryScrap> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:inventory:scrap:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpInventoryScrapSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:inventory:scrap:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpInventoryScrapSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:inventory:scrap:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
