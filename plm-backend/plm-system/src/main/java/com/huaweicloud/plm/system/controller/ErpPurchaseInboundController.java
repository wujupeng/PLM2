package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpPurchaseInboundQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseInboundSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseInbound;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpPurchaseInboundService;
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
 * 采购入库单接口（G3-N3a ERP 采购管理）：
 * 采购入库单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/purchase/inbounds")
@RequiredArgsConstructor
public class ErpPurchaseInboundController {

    private final ErpPurchaseInboundService service;

    @GetMapping
    @RequirePermission("erp:purchase:inbound:list")
    public ApiResponse<PageResult<ErpPurchaseInbound>> page(ErpPurchaseInboundQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:purchase:inbound:list")
    public ApiResponse<ErpPurchaseInbound> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:purchase:inbound:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpPurchaseInboundSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:purchase:inbound:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpPurchaseInboundSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:purchase:inbound:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
