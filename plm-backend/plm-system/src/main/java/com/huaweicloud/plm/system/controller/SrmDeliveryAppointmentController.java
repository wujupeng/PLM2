package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmDeliveryAppointmentQuery;
import com.huaweicloud.plm.system.dto.SrmDeliveryAppointmentSaveRequest;
import com.huaweicloud.plm.system.entity.SrmDeliveryAppointment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmDeliveryAppointmentService;
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
 * 送货预约接口（对应送货预约）：
 * 送货预约登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/appointments")
@RequiredArgsConstructor
public class SrmDeliveryAppointmentController {

    private final SrmDeliveryAppointmentService service;

    @GetMapping
    @RequirePermission("srm:collab:appointment:list")
    public ApiResponse<PageResult<SrmDeliveryAppointment>> page(SrmDeliveryAppointmentQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:collab:appointment:list")
    public ApiResponse<SrmDeliveryAppointment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:collab:appointment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmDeliveryAppointmentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:collab:appointment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmDeliveryAppointmentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:collab:appointment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
