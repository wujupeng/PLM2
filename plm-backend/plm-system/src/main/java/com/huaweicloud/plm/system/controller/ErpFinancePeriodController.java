package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinancePeriodQuery;
import com.huaweicloud.plm.system.dto.ErpFinancePeriodSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinancePeriod;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinancePeriodService;
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
 * 会计期间接口（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）：
 * 会计期间登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/periods")
@RequiredArgsConstructor
public class ErpFinancePeriodController {

    private final ErpFinancePeriodService service;

    @GetMapping
    @RequirePermission("erp:finance:period:list")
    public ApiResponse<PageResult<ErpFinancePeriod>> page(ErpFinancePeriodQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:period:list")
    public ApiResponse<ErpFinancePeriod> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:period:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinancePeriodSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:period:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinancePeriodSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:period:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
