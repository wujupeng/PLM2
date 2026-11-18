package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpCustomerQuery;
import com.huaweicloud.plm.system.dto.ErpCustomerSaveRequest;
import com.huaweicloud.plm.system.entity.ErpCustomer;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpCustomerService;
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
 * 客户业务档案接口（G3-N1 ERP 基础资料 WBS T021）：
 * 客户档案登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/base/customers")
@RequiredArgsConstructor
public class ErpCustomerController {

    private final ErpCustomerService service;

    @GetMapping
    @RequirePermission("erp:base:customer:list")
    public ApiResponse<PageResult<ErpCustomer>> page(ErpCustomerQuery query) {
        return ApiResponse.success(service.pageCustomers(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:base:customer:list")
    public ApiResponse<ErpCustomer> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:base:customer:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpCustomerSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:base:customer:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpCustomerSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:base:customer:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
