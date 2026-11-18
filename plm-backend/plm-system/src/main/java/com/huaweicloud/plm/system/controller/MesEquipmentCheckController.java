package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesEquipmentCheckQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentCheckSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipmentCheck;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesEquipmentCheckService;
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
 * 设备点检接口：点检记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/equipment/checks")
@RequiredArgsConstructor
public class MesEquipmentCheckController {

    private final MesEquipmentCheckService service;

    @GetMapping
    @RequirePermission("mes:equipment:check:list")
    public ApiResponse<PageResult<MesEquipmentCheck>> page(MesEquipmentCheckQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:equipment:check:list")
    public ApiResponse<MesEquipmentCheck> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:equipment:check:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesEquipmentCheckSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:equipment:check:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesEquipmentCheckSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:equipment:check:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
