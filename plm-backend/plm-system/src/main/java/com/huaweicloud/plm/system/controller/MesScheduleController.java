package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesScheduleQuery;
import com.huaweicloud.plm.system.dto.MesScheduleSaveRequest;
import com.huaweicloud.plm.system.entity.MesSchedule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesScheduleService;
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
 * 排产计划接口：排产登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/plan/schedules")
@RequiredArgsConstructor
public class MesScheduleController {

    private final MesScheduleService service;

    @GetMapping
    @RequirePermission("mes:plan:schedule:list")
    public ApiResponse<PageResult<MesSchedule>> page(MesScheduleQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:plan:schedule:list")
    public ApiResponse<MesSchedule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:plan:schedule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesScheduleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:plan:schedule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesScheduleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:plan:schedule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
