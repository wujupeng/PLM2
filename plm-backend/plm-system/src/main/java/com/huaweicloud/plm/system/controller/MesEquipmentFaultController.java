package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesEquipmentFaultQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentFaultSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipmentFault;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesEquipmentFaultService;
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
 * 设备故障接口：故障登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/equipment/faults")
@RequiredArgsConstructor
public class MesEquipmentFaultController {

    private final MesEquipmentFaultService service;

    @GetMapping
    @RequirePermission("mes:equipment:fault:list")
    public ApiResponse<PageResult<MesEquipmentFault>> page(MesEquipmentFaultQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:equipment:fault:list")
    public ApiResponse<MesEquipmentFault> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:equipment:fault:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesEquipmentFaultSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:equipment:fault:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesEquipmentFaultSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:equipment:fault:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
