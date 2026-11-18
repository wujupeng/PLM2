package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpSalesForecastQuery;
import com.huaweicloud.plm.system.dto.ErpSalesForecastSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesForecast;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpSalesForecastService;
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
 * 销售预测接口（G3-N2 ERP 销售管理）：
 * 销售预测登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/sales/forecasts")
@RequiredArgsConstructor
public class ErpSalesForecastController {

    private final ErpSalesForecastService service;

    @GetMapping
    @RequirePermission("erp:sales:forecast:list")
    public ApiResponse<PageResult<ErpSalesForecast>> page(ErpSalesForecastQuery query) {
        return ApiResponse.success(service.pageForecasts(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:forecast:list")
    public ApiResponse<ErpSalesForecast> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:forecast:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpSalesForecastSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:forecast:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpSalesForecastSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:forecast:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
