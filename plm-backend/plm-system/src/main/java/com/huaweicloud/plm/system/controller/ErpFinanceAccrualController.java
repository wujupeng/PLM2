package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinanceAccrualQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceAccrualSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceAccrual;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinanceAccrualService;
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
 * 暂估接口（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 暂估登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/accruals")
@RequiredArgsConstructor
public class ErpFinanceAccrualController {

    private final ErpFinanceAccrualService service;

    @GetMapping
    @RequirePermission("erp:finance:accrual:list")
    public ApiResponse<PageResult<ErpFinanceAccrual>> page(ErpFinanceAccrualQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:accrual:list")
    public ApiResponse<ErpFinanceAccrual> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:accrual:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinanceAccrualSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:accrual:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinanceAccrualSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:accrual:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
