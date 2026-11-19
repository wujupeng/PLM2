package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgEdiGatewayReconcileQuery;
import com.huaweicloud.plm.system.dto.IntgEdiGatewayReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.IntgEdiGatewayReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgEdiGatewayReconcileService;
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
 * EDI 网关对账接口：EDI 网关入站报文对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/edi-gateway/reconciles")
@RequiredArgsConstructor
public class IntgEdiGatewayReconcileController {

    private final IntgEdiGatewayReconcileService service;

    @GetMapping
    @RequirePermission("intg:edi-gateway:reconcile:list")
    public ApiResponse<PageResult<IntgEdiGatewayReconcile>> page(IntgEdiGatewayReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:edi-gateway:reconcile:list")
    public ApiResponse<IntgEdiGatewayReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:edi-gateway:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgEdiGatewayReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:edi-gateway:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgEdiGatewayReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:edi-gateway:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
