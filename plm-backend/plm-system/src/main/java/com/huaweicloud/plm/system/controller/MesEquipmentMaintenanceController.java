package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesEquipmentMaintenanceQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentMaintenanceSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipmentMaintenance;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesEquipmentMaintenanceService;
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
 * 设备保养记录接口：设备保养登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/equipment/maintenances")
@RequiredArgsConstructor
public class MesEquipmentMaintenanceController {

    private final MesEquipmentMaintenanceService service;

    @GetMapping
    @RequirePermission("mes:equipment:maintenance:list")
    public ApiResponse<PageResult<MesEquipmentMaintenance>> page(MesEquipmentMaintenanceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:equipment:maintenance:list")
    public ApiResponse<MesEquipmentMaintenance> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:equipment:maintenance:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesEquipmentMaintenanceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:equipment:maintenance:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesEquipmentMaintenanceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:equipment:maintenance:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
