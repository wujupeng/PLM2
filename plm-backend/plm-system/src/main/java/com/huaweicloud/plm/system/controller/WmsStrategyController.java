package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsStrategyQuery;
import com.huaweicloud.plm.system.dto.WmsStrategySaveRequest;
import com.huaweicloud.plm.system.entity.WmsStrategy;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsStrategyService;
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
 * 作业策略接口（对应作业策略）：
 * 作业策略登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/base/strategies")
@RequiredArgsConstructor
public class WmsStrategyController {

    private final WmsStrategyService service;

    @GetMapping
    @RequirePermission("wms:base:strategy:list")
    public ApiResponse<PageResult<WmsStrategy>> page(WmsStrategyQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:base:strategy:list")
    public ApiResponse<WmsStrategy> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:base:strategy:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsStrategySaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:base:strategy:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsStrategySaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:base:strategy:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
