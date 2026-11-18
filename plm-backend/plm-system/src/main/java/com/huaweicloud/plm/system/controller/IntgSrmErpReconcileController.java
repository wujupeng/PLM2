package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgSrmErpReconcileQuery;
import com.huaweicloud.plm.system.dto.IntgSrmErpReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.IntgSrmErpReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgSrmErpReconcileService;
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
 * SRM→ERP 对账接口：SRM 与 ERP 集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/srm-erp/reconciles")
@RequiredArgsConstructor
public class IntgSrmErpReconcileController {

    private final IntgSrmErpReconcileService service;

    @GetMapping
    @RequirePermission("intg:srm-erp:reconcile:list")
    public ApiResponse<PageResult<IntgSrmErpReconcile>> page(IntgSrmErpReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:srm-erp:reconcile:list")
    public ApiResponse<IntgSrmErpReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:srm-erp:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgSrmErpReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:srm-erp:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgSrmErpReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:srm-erp:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
