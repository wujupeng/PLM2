package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpWmsReconcileQuery;
import com.huaweicloud.plm.system.dto.IntgErpWmsReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpWmsReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpWmsReconcileService;
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
 * ERP↔WMS 对账接口：ERP 与 WMS 集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/erp-wms/reconciles")
@RequiredArgsConstructor
public class IntgErpWmsReconcileController {

    private final IntgErpWmsReconcileService service;

    @GetMapping
    @RequirePermission("intg:erp-wms:reconcile:list")
    public ApiResponse<PageResult<IntgErpWmsReconcile>> page(IntgErpWmsReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-wms:reconcile:list")
    public ApiResponse<IntgErpWmsReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-wms:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpWmsReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-wms:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpWmsReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-wms:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
