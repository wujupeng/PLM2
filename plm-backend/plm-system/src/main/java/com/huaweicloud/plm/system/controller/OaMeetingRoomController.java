package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MeetingRoomQuery;
import com.huaweicloud.plm.system.dto.MeetingRoomSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrMeetingRoom;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMeetingRoomService;
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
 * 会议室接口（OA-DEV-058）：会议室基础信息维护，以及供预约选择的启用会议室列表。
 */
@RestController
@RequestMapping("/oa/meeting-rooms")
@RequiredArgsConstructor
public class OaMeetingRoomController {

    private final OaMeetingRoomService meetingRoomService;

    @GetMapping
    @RequirePermission("oa:meeting:list")
    public ApiResponse<PageResult<OaHrMeetingRoom>> page(MeetingRoomQuery query) {
        return ApiResponse.success(meetingRoomService.page(query));
    }

    /** 启用会议室列表：供会议室预约表单下拉选择。 */
    @GetMapping("/all")
    @RequirePermission("oa:meeting:book")
    public ApiResponse<List<OaHrMeetingRoom>> listAll() {
        return ApiResponse.success(meetingRoomService.listAll());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:meeting:list")
    public ApiResponse<OaHrMeetingRoom> detail(@PathVariable Long id) {
        return ApiResponse.success(meetingRoomService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:meeting:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MeetingRoomSaveRequest request) {
        return ApiResponse.success(meetingRoomService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:meeting:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody MeetingRoomSaveRequest request) {
        meetingRoomService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:meeting:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        meetingRoomService.delete(id);
        return ApiResponse.success();
    }
}
