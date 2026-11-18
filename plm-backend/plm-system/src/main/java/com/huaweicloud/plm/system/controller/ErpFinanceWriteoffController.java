package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinanceWriteoffQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceWriteoffSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceWriteoff;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinanceWriteoffService;
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
 * 核销单接口（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 核销登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/writeoffs")
@RequiredArgsConstructor
public class ErpFinanceWriteoffController {

    private final ErpFinanceWriteoffService service;

    @GetMapping
    @RequirePermission("erp:finance:writeoff:list")
    public ApiResponse<PageResult<ErpFinanceWriteoff>> page(ErpFinanceWriteoffQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:writeoff:list")
    public ApiResponse<ErpFinanceWriteoff> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:writeoff:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinanceWriteoffSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:writeoff:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinanceWriteoffSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:writeoff:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
