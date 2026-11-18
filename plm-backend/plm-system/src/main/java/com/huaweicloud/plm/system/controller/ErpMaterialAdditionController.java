package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpMaterialAdditionQuery;
import com.huaweicloud.plm.system.dto.ErpMaterialAdditionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpMaterialAddition;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpMaterialAdditionService;
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
 * 生产补料单接口（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 生产补料登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/production/material-additions")
@RequiredArgsConstructor
public class ErpMaterialAdditionController {

    private final ErpMaterialAdditionService service;

    @GetMapping
    @RequirePermission("erp:production:addition:list")
    public ApiResponse<PageResult<ErpMaterialAddition>> page(ErpMaterialAdditionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:production:addition:list")
    public ApiResponse<ErpMaterialAddition> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:production:addition:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpMaterialAdditionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:production:addition:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpMaterialAdditionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:production:addition:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
