package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.AnnouncementQuery;
import com.huaweicloud.plm.system.dto.AnnouncementSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaAnnouncement;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaAnnouncementService;
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
 * 公告与新闻接口（OA-DEV-059）：发布、下线、阅读登记与阅读数统计。
 */
@RestController
@RequestMapping("/oa/announcements")
@RequiredArgsConstructor
public class OaAnnouncementController {

    private final OaAnnouncementService announcementService;

    @GetMapping
    @RequirePermission("oa:collab:list")
    public ApiResponse<PageResult<OaOaAnnouncement>> page(AnnouncementQuery query) {
        return ApiResponse.success(announcementService.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:collab:list")
    public ApiResponse<OaOaAnnouncement> detail(@PathVariable Long id) {
        return ApiResponse.success(announcementService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Long> create(@Valid @RequestBody AnnouncementSaveRequest request) {
        return ApiResponse.success(announcementService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody AnnouncementSaveRequest request) {
        announcementService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/publish")
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Void> publish(@PathVariable Long id) {
        announcementService.publish(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/offline")
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Void> offline(@PathVariable Long id) {
        announcementService.offline(id);
        return ApiResponse.success();
    }

    /** 标记已读：登记当前用户的阅读记录。 */
    @PostMapping("/{id}/read")
    @RequirePermission("oa:collab:list")
    public ApiResponse<Void> markRead(@PathVariable Long id) {
        announcementService.markRead(id);
        return ApiResponse.success();
    }
}
