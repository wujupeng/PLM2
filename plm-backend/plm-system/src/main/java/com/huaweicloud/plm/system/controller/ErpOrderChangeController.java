package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpOrderChangeQuery;
import com.huaweicloud.plm.system.dto.ErpOrderChangeSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOrderChange;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpOrderChangeService;
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
 * 订单变更接口（G3-N2 ERP 销售管理）：
 * 订单变更登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/sales/order-changes")
@RequiredArgsConstructor
public class ErpOrderChangeController {

    private final ErpOrderChangeService service;

    @GetMapping
    @RequirePermission("erp:sales:orderchange:list")
    public ApiResponse<PageResult<ErpOrderChange>> page(ErpOrderChangeQuery query) {
        return ApiResponse.success(service.pageOrderChanges(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:orderchange:list")
    public ApiResponse<ErpOrderChange> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:orderchange:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpOrderChangeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:orderchange:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpOrderChangeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:orderchange:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
