package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpOutsourceOrderService;
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
 * 委外订单接口（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 委外订单头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/outsource/orders")
@RequiredArgsConstructor
public class ErpOutsourceOrderController {

    private final ErpOutsourceOrderService service;

    @GetMapping
    @RequirePermission("erp:outsource:order:list")
    public ApiResponse<PageResult<ErpOutsourceOrder>> page(ErpOutsourceOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:outsource:order:list")
    public ApiResponse<ErpOutsourceOrderDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:outsource:order:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpOutsourceOrderSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:outsource:order:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpOutsourceOrderSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:outsource:order:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:outsource:order:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpOutsourceOrderLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:outsource:order:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpOutsourceOrderLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:outsource:order:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
