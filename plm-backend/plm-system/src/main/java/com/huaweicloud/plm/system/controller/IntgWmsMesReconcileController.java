package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgWmsMesReconcileQuery;
import com.huaweicloud.plm.system.dto.IntgWmsMesReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.IntgWmsMesReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgWmsMesReconcileService;
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
 * WMS↔MES 对账接口：WMS 与 MES 集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/wms-mes/reconciles")
@RequiredArgsConstructor
public class IntgWmsMesReconcileController {

    private final IntgWmsMesReconcileService service;

    @GetMapping
    @RequirePermission("intg:wms-mes:reconcile:list")
    public ApiResponse<PageResult<IntgWmsMesReconcile>> page(IntgWmsMesReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:wms-mes:reconcile:list")
    public ApiResponse<IntgWmsMesReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:wms-mes:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgWmsMesReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:wms-mes:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgWmsMesReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:wms-mes:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
