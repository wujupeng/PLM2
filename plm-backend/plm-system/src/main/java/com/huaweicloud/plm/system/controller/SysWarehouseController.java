package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysWarehouseSaveRequest;
import com.huaweicloud.plm.system.entity.SysWarehouse;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysWarehouseService;
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

import java.util.Map;

/**
 * 仓库接口（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 仓库登记、启停状态流转。
 */
@RestController
@RequestMapping("/platform/org/warehouses")
@RequiredArgsConstructor
public class SysWarehouseController {

    private final SysWarehouseService service;

    @GetMapping
    @RequirePermission("platform:org:warehouse:list")
    public ApiResponse<PageResult<SysWarehouse>> page(OrgQuery query) {
        return ApiResponse.success(service.pageWarehouses(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:org:warehouse:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:org:warehouse:list")
    public ApiResponse<SysWarehouse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:org:warehouse:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysWarehouseSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:org:warehouse:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysWarehouseSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:org:warehouse:manage")
    public ApiResponse<SysWarehouse> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:org:warehouse:manage")
    public ApiResponse<SysWarehouse> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:org:warehouse:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
