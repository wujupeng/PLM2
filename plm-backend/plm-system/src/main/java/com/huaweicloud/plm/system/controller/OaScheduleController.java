package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ScheduleQuery;
import com.huaweicloud.plm.system.dto.ScheduleSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaSchedule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaScheduleService;
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
 * 日程接口（OA-DEV-058）：个人与共享日程的维护，支持提醒设置。
 */
@RestController
@RequestMapping("/oa/schedules")
@RequiredArgsConstructor
public class OaScheduleController {

    private final OaScheduleService scheduleService;

    /** 日程分页：传入 ownerUserId 时仅返回该所有者的日程。 */
    @GetMapping
    @RequirePermission("oa:schedule:edit")
    public ApiResponse<PageResult<OaOaSchedule>> page(ScheduleQuery query) {
        return ApiResponse.success(scheduleService.page(query, query.getOwnerUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:schedule:edit")
    public ApiResponse<OaOaSchedule> detail(@PathVariable Long id) {
        return ApiResponse.success(scheduleService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:schedule:edit")
    public ApiResponse<Long> create(@Valid @RequestBody ScheduleSaveRequest request) {
        return ApiResponse.success(scheduleService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:schedule:edit")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ScheduleSaveRequest request) {
        scheduleService.save(id, request);
        return ApiResponse.success();
    }

    /** 取消日程。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:schedule:edit")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        scheduleService.cancel(id);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:schedule:edit")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ApiResponse.success();
    }
}
