package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MobileDeviceQuery;
import com.huaweicloud.plm.system.dto.MobileDeviceSaveRequest;
import com.huaweicloud.plm.system.entity.SysMobileDevice;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMobileDeviceService;
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
 * PDA 设备接口（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 设备登记、分页查询、启停状态流转与删除。
 */
@RestController
@RequestMapping("/platform/mobile/devices")
@RequiredArgsConstructor
public class SysMobileDeviceController {

    private final SysMobileDeviceService service;

    @GetMapping
    @RequirePermission("platform:mobile:device:list")
    public ApiResponse<PageResult<SysMobileDevice>> page(MobileDeviceQuery query) {
        return ApiResponse.success(service.pageDevices(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mobile:device:list")
    public ApiResponse<SysMobileDevice> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mobile:device:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MobileDeviceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mobile:device:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MobileDeviceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 启用：设备状态置为 ACTIVE。 */
    @PostMapping("/{id}/enable")
    @RequirePermission("platform:mobile:device:manage")
    public ApiResponse<SysMobileDevice> enable(@PathVariable Long id) {
        return ApiResponse.success(service.enable(id));
    }

    /** 停用：设备状态置为 DISABLED。 */
    @PostMapping("/{id}/disable")
    @RequirePermission("platform:mobile:device:manage")
    public ApiResponse<SysMobileDevice> disable(@PathVariable Long id) {
        return ApiResponse.success(service.disable(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mobile:device:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
