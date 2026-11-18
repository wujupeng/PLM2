package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.HrVehicleQuery;
import com.huaweicloud.plm.system.dto.HrVehicleSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrVehicle;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaHrVehicleService;
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

import java.util.List;

/**
 * 车辆档案接口（OA-DEV-058）：车辆基础信息维护，以及供用车申请选择的可用车辆列表。
 */
@RestController
@RequestMapping("/oa/hr/vehicles")
@RequiredArgsConstructor
public class OaHrVehicleController {

    private final OaHrVehicleService vehicleService;

    @GetMapping
    @RequirePermission("oa:hr:vehicle:manage")
    public ApiResponse<PageResult<OaHrVehicle>> page(HrVehicleQuery query) {
        return ApiResponse.success(vehicleService.page(query));
    }

    /** 可用车辆列表：供用车申请表单下拉选择。 */
    @GetMapping("/all")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<List<OaHrVehicle>> listAll() {
        return ApiResponse.success(vehicleService.listAll());
    }

    @PostMapping
    @RequirePermission("oa:hr:vehicle:manage")
    public ApiResponse<Long> create(@Valid @RequestBody HrVehicleSaveRequest request) {
        return ApiResponse.success(vehicleService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:hr:vehicle:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody HrVehicleSaveRequest request) {
        vehicleService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:hr:vehicle:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ApiResponse.success();
    }
}
