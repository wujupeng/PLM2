package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgMesErpReconcileQuery;
import com.huaweicloud.plm.system.dto.IntgMesErpReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.IntgMesErpReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgMesErpReconcileService;
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
 * MES→ERP 对账接口：MES 与 ERP 集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/mes-erp/reconciles")
@RequiredArgsConstructor
public class IntgMesErpReconcileController {

    private final IntgMesErpReconcileService service;

    @GetMapping
    @RequirePermission("intg:mes-erp:reconcile:list")
    public ApiResponse<PageResult<IntgMesErpReconcile>> page(IntgMesErpReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:mes-erp:reconcile:list")
    public ApiResponse<IntgMesErpReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:mes-erp:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgMesErpReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:mes-erp:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgMesErpReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:mes-erp:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
