package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.CollabCommentSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaCollabComment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaCollabCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 协同评论接口（OA-DEV-060）：按业务对象查询与新增评论。
 */
@RestController
@RequestMapping("/oa/collab-comments")
@RequiredArgsConstructor
public class OaCollabCommentController {

    private final OaCollabCommentService collabCommentService;

    @GetMapping
    @RequirePermission("oa:collab:list")
    public ApiResponse<List<OaOaCollabComment>> list(@RequestParam String bizType, @RequestParam Long bizId) {
        return ApiResponse.success(collabCommentService.list(bizType, bizId));
    }

    @PostMapping
    @RequirePermission("oa:collab:list")
    public ApiResponse<Long> create(@Valid @RequestBody CollabCommentSaveRequest request) {
        return ApiResponse.success(collabCommentService.add(request));
    }

    /** 删除评论：仅评论人或管理员可删除。 */
    @DeleteMapping("/{id}")
    @RequirePermission("oa:collab:list")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        collabCommentService.delete(id);
        return ApiResponse.success();
    }
}
