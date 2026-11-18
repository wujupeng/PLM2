package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MeetingBookingQuery;
import com.huaweicloud.plm.system.dto.MeetingBookingSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrMeetingBooking;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMeetingBookingService;
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
 * 会议室预约接口（OA-DEV-058）：预约保存并校验时段冲突，支持取消与完成。
 */
@RestController
@RequestMapping("/oa/meeting-bookings")
@RequiredArgsConstructor
public class OaMeetingBookingController {

    private final OaMeetingBookingService bookingService;

    /** 预约分页：传入 organizerUserId 时仅返回该组织者的预约。 */
    @GetMapping
    @RequirePermission("oa:meeting:list")
    public ApiResponse<PageResult<OaHrMeetingBooking>> page(MeetingBookingQuery query) {
        return ApiResponse.success(bookingService.page(query, query.getOrganizerUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:meeting:list")
    public ApiResponse<OaHrMeetingBooking> detail(@PathVariable Long id) {
        return ApiResponse.success(bookingService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:meeting:book")
    public ApiResponse<Long> create(@Valid @RequestBody MeetingBookingSaveRequest request) {
        return ApiResponse.success(bookingService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:meeting:book")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody MeetingBookingSaveRequest request) {
        bookingService.save(id, request);
        return ApiResponse.success();
    }

    /** 取消预约。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:meeting:book")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        bookingService.cancel(id);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:meeting:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        bookingService.delete(id);
        return ApiResponse.success();
    }
}
