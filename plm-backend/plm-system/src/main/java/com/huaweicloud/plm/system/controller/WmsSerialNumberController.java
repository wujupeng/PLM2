package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsSerialNumberQuery;
import com.huaweicloud.plm.system.dto.WmsSerialNumberSaveRequest;
import com.huaweicloud.plm.system.entity.WmsSerialNumber;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsSerialNumberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wms/inventory/serials")
@RequiredArgsConstructor
public class WmsSerialNumberController {

    private final WmsSerialNumberService service;

    @GetMapping
    @RequirePermission("wms:inventory:serial:list")
    public ApiResponse<PageResult<WmsSerialNumber>> page(WmsSerialNumberQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:inventory:serial:list")
    public ApiResponse<WmsSerialNumber> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:inventory:serial:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsSerialNumberSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:inventory:serial:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsSerialNumberSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:inventory:serial:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
