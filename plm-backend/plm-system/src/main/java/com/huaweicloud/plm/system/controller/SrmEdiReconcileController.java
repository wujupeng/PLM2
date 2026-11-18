package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmEdiReconcileQuery;
import com.huaweicloud.plm.system.dto.SrmEdiReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.SrmEdiReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmEdiReconcileService;
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
 * EDI 对账接口（对应 EDI 对账）：
 * 对账单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/edi/reconciles")
@RequiredArgsConstructor
public class SrmEdiReconcileController {

    private final SrmEdiReconcileService service;

    @GetMapping
    @RequirePermission("srm:edi:reconcile:list")
    public ApiResponse<PageResult<SrmEdiReconcile>> page(SrmEdiReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:edi:reconcile:list")
    public ApiResponse<SrmEdiReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:edi:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmEdiReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:edi:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmEdiReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:edi:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
