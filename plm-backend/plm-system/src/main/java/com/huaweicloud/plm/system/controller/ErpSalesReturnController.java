package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpSalesReturnQuery;
import com.huaweicloud.plm.system.dto.ErpSalesReturnSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesReturn;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpSalesReturnService;
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
 * 销售退货接口（G3-N2 ERP 销售管理）：
 * 销售退货单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/sales/returns")
@RequiredArgsConstructor
public class ErpSalesReturnController {

    private final ErpSalesReturnService service;

    @GetMapping
    @RequirePermission("erp:sales:return:list")
    public ApiResponse<PageResult<ErpSalesReturn>> page(ErpSalesReturnQuery query) {
        return ApiResponse.success(service.pageReturns(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:return:list")
    public ApiResponse<ErpSalesReturn> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:return:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpSalesReturnSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:return:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpSalesReturnSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:return:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
