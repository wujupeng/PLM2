package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpSalesOutboundQuery;
import com.huaweicloud.plm.system.dto.ErpSalesOutboundSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesOutbound;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpSalesOutboundService;
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
 * 销售出库接口（G3-N2 ERP 销售管理）：
 * 出库单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/sales/outbounds")
@RequiredArgsConstructor
public class ErpSalesOutboundController {

    private final ErpSalesOutboundService service;

    @GetMapping
    @RequirePermission("erp:sales:outbound:list")
    public ApiResponse<PageResult<ErpSalesOutbound>> page(ErpSalesOutboundQuery query) {
        return ApiResponse.success(service.pageOutbounds(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:outbound:list")
    public ApiResponse<ErpSalesOutbound> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:outbound:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpSalesOutboundSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:outbound:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpSalesOutboundSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:outbound:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
