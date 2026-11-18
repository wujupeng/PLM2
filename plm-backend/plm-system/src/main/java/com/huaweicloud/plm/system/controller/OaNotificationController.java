package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.NotificationBroadcastRequest;
import com.huaweicloud.plm.system.dto.NotificationQuery;
import com.huaweicloud.plm.system.entity.OaNotification;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oa/notifications")
@RequiredArgsConstructor
public class OaNotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @RequirePermission("oa:notification:list")
    public ApiResponse<PageResult<OaNotification>> page(NotificationQuery query) {
        return ApiResponse.success(notificationService.page(query));
    }

    /** 未读消息数，供门户与菜单角标使用。 */
    @GetMapping("/unread-count")
    @RequirePermission("oa:notification:list")
    public ApiResponse<Long> unreadCount() {
        return ApiResponse.success(notificationService.unreadCount());
    }

    @GetMapping("/{notificationId}")
    @RequirePermission("oa:notification:list")
    public ApiResponse<OaNotification> detail(@PathVariable Long notificationId) {
        return ApiResponse.success(notificationService.detail(notificationId));
    }

    @PutMapping("/{notificationId}/read")
    @RequirePermission("oa:notification:list")
    public ApiResponse<Void> markRead(@PathVariable Long notificationId,
                                      @RequestParam(required = false) Integer readFlag) {
        notificationService.markRead(notificationId, readFlag);
        return ApiResponse.success();
    }

    @PutMapping("/read-all")
    @RequirePermission("oa:notification:list")
    public ApiResponse<Integer> markAllRead() {
        return ApiResponse.success(notificationService.markAllRead());
    }

    @PutMapping("/{notificationId}/archive")
    @RequirePermission("oa:notification:list")
    public ApiResponse<Void> archive(@PathVariable Long notificationId,
                                     @RequestParam(required = false) Integer archivedFlag) {
        notificationService.archive(notificationId, archivedFlag);
        return ApiResponse.success();
    }

    /** 管理员群发站内通知。 */
    @PostMapping("/broadcast")
    @RequirePermission("oa:notification:send")
    public ApiResponse<Integer> broadcast(@Valid @RequestBody NotificationBroadcastRequest request) {
        return ApiResponse.success(notificationService.broadcast(request));
    }
}
