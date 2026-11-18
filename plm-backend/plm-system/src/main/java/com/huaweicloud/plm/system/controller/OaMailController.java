package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MailDetailResponse;
import com.huaweicloud.plm.system.dto.MailItemResponse;
import com.huaweicloud.plm.system.dto.MailMessageQuery;
import com.huaweicloud.plm.system.dto.MailMoveRequest;
import com.huaweicloud.plm.system.dto.MailSendRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MailMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oa/mails")
@RequiredArgsConstructor
public class OaMailController {

    private final MailMessageService mailMessageService;

    @GetMapping
    @RequirePermission("oa:mail:list")
    public ApiResponse<PageResult<MailItemResponse>> page(MailMessageQuery query) {
        return ApiResponse.success(mailMessageService.page(query));
    }

    /** 未读邮件数，供门户与菜单角标使用。 */
    @GetMapping("/unread-count")
    @RequirePermission("oa:mail:list")
    public ApiResponse<Long> unreadCount() {
        return ApiResponse.success(mailMessageService.unreadCount());
    }

    @GetMapping("/{messageId}")
    @RequirePermission("oa:mail:list")
    public ApiResponse<MailDetailResponse> detail(@PathVariable Long messageId) {
        return ApiResponse.success(mailMessageService.detail(messageId));
    }

    /** 写信：新建、回复、转发与保存草稿共用同一入口。 */
    @PostMapping
    @RequirePermission("oa:mail:send")
    public ApiResponse<Long> send(@Valid @RequestBody MailSendRequest request) {
        return ApiResponse.success(mailMessageService.send(request));
    }

    @PutMapping("/{messageId}/read")
    @RequirePermission("oa:mail:list")
    public ApiResponse<Void> markRead(@PathVariable Long messageId,
                                      @RequestParam(required = false) Integer readFlag) {
        mailMessageService.markRead(messageId, readFlag);
        return ApiResponse.success();
    }

    @PutMapping("/{messageId}/star")
    @RequirePermission("oa:mail:list")
    public ApiResponse<Void> markStar(@PathVariable Long messageId,
                                      @RequestParam(required = false) Integer starFlag) {
        mailMessageService.markStar(messageId, starFlag);
        return ApiResponse.success();
    }

    @PutMapping("/{messageId}/move")
    @RequirePermission("oa:mail:list")
    public ApiResponse<Void> move(@PathVariable Long messageId,
                                  @Valid @RequestBody MailMoveRequest request) {
        mailMessageService.move(messageId, request.getFolderCode());
        return ApiResponse.success();
    }

    @DeleteMapping("/{messageId}")
    @RequirePermission("oa:mail:delete")
    public ApiResponse<Void> delete(@PathVariable Long messageId) {
        mailMessageService.delete(messageId);
        return ApiResponse.success();
    }
}
