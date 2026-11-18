package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesEquipmentQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesEquipmentService;
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
 * 设备台账接口：设备登记、分页查询、详情与删除。
 */
@RestController
@RequestMapping("/mes/equipment/ledgers")
@RequiredArgsConstructor
public class MesEquipmentController {

    private final MesEquipmentService service;

    @GetMapping
    @RequirePermission("mes:equipment:ledger:list")
    public ApiResponse<PageResult<MesEquipment>> page(MesEquipmentQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:equipment:ledger:list")
    public ApiResponse<MesEquipment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:equipment:ledger:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesEquipmentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:equipment:ledger:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesEquipmentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:equipment:ledger:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
