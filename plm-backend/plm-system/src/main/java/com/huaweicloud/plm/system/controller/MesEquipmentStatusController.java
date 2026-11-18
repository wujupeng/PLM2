package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesEquipmentStatusQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentStatusSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipmentStatus;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesEquipmentStatusService;
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
 * MES 设备状态记录接口：设备状态登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/equipment/statuses")
@RequiredArgsConstructor
public class MesEquipmentStatusController {

    private final MesEquipmentStatusService service;

    @GetMapping
    @RequirePermission("mes:equipment:status:list")
    public ApiResponse<PageResult<MesEquipmentStatus>> page(MesEquipmentStatusQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:equipment:status:list")
    public ApiResponse<MesEquipmentStatus> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:equipment:status:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesEquipmentStatusSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:equipment:status:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesEquipmentStatusSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:equipment:status:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
