package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesProdOrderQuery;
import com.huaweicloud.plm.system.dto.MesProdOrderSaveRequest;
import com.huaweicloud.plm.system.entity.MesProdOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesProdOrderService;
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
 * 生产工单接口：ERP工单接收登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/plan/orders")
@RequiredArgsConstructor
public class MesProdOrderController {

    private final MesProdOrderService service;

    @GetMapping
    @RequirePermission("mes:plan:order:list")
    public ApiResponse<PageResult<MesProdOrder>> page(MesProdOrderQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:plan:order:list")
    public ApiResponse<MesProdOrder> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:plan:order:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesProdOrderSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:plan:order:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesProdOrderSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:plan:order:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
