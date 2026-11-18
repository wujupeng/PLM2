package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProductionOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpProductionOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpProductionOrderQuery;
import com.huaweicloud.plm.system.dto.ErpProductionOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProductionOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProductionOrderService;
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
 * 生产订单接口（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 生产订单头与明细行的登记、分页查询、明细维护与删除。
 */
@RestController
@RequestMapping("/erp/production/orders")
@RequiredArgsConstructor
public class ErpProductionOrderController {

    private final ErpProductionOrderService service;

    @GetMapping
    @RequirePermission("erp:production:order:list")
    public ApiResponse<PageResult<ErpProductionOrder>> page(ErpProductionOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:production:order:list")
    public ApiResponse<ErpProductionOrderDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:production:order:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProductionOrderSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:production:order:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpProductionOrderSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:production:order:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:production:order:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpProductionOrderLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:production:order:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpProductionOrderLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:production:order:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
