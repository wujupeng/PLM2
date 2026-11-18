package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsZoneQuery;
import com.huaweicloud.plm.system.dto.WmsZoneSaveRequest;
import com.huaweicloud.plm.system.entity.WmsZone;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsZoneService;
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
 * 库区接口（对应库区）：
 * 库区登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/base/zones")
@RequiredArgsConstructor
public class WmsZoneController {

    private final WmsZoneService service;

    @GetMapping
    @RequirePermission("wms:base:zone:list")
    public ApiResponse<PageResult<WmsZone>> page(WmsZoneQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:base:zone:list")
    public ApiResponse<WmsZone> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:base:zone:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsZoneSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:base:zone:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsZoneSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:base:zone:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
