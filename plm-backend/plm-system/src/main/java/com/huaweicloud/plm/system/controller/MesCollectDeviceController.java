package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesCollectDeviceQuery;
import com.huaweicloud.plm.system.dto.MesCollectDeviceSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectDevice;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesCollectDeviceService;
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
 * 采集设备接口：采集设备登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/collect/devices")
@RequiredArgsConstructor
public class MesCollectDeviceController {

    private final MesCollectDeviceService service;

    @GetMapping
    @RequirePermission("mes:collect:device:list")
    public ApiResponse<PageResult<MesCollectDevice>> page(MesCollectDeviceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:collect:device:list")
    public ApiResponse<MesCollectDevice> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:collect:device:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesCollectDeviceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:collect:device:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesCollectDeviceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:collect:device:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
