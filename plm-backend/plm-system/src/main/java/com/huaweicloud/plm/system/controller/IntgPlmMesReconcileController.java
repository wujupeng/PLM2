package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmMesReconcileQuery;
import com.huaweicloud.plm.system.dto.IntgPlmMesReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmMesReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmMesReconcileService;
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
 * MES 对账接口：PLM 与 MES 集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-mes/reconciles")
@RequiredArgsConstructor
public class IntgPlmMesReconcileController {

    private final IntgPlmMesReconcileService service;

    @GetMapping
    @RequirePermission("intg:plm-mes:reconcile:list")
    public ApiResponse<PageResult<IntgPlmMesReconcile>> page(IntgPlmMesReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-mes:reconcile:list")
    public ApiResponse<IntgPlmMesReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-mes:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmMesReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-mes:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmMesReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-mes:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
