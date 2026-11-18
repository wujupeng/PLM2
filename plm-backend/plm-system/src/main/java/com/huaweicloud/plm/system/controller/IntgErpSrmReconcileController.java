package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpSrmReconcileQuery;
import com.huaweicloud.plm.system.dto.IntgErpSrmReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpSrmReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpSrmReconcileService;
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
 * SRM 对账接口：PLM 与 SRM 集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/erp-srm/reconciles")
@RequiredArgsConstructor
public class IntgErpSrmReconcileController {

    private final IntgErpSrmReconcileService service;

    @GetMapping
    @RequirePermission("intg:erp-srm:reconcile:list")
    public ApiResponse<PageResult<IntgErpSrmReconcile>> page(IntgErpSrmReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-srm:reconcile:list")
    public ApiResponse<IntgErpSrmReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-srm:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpSrmReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-srm:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpSrmReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-srm:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
