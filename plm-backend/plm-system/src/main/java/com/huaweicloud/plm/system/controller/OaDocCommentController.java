package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.DocCommentItem;
import com.huaweicloud.plm.system.dto.DocCommentSaveRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaDocCommentService;
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
 * 文档评论与协作接口（OA-DEV-050）：支持针对指定版本与父评论的讨论，以及 @ 提醒。
 */
@RestController
@RequestMapping("/oa/doc-comments")
@RequiredArgsConstructor
public class OaDocCommentController {

    private final OaDocCommentService commentService;

    @GetMapping
    @RequirePermission("oa:doc:list")
    public ApiResponse<List<DocCommentItem>> list(@RequestParam Long docId) {
        return ApiResponse.success(commentService.list(docId));
    }

    @PostMapping
    @RequirePermission("oa:doc:comment")
    public ApiResponse<Long> create(@RequestParam Long docId,
                                    @Valid @RequestBody DocCommentSaveRequest request) {
        return ApiResponse.success(commentService.create(docId, request));
    }

    @DeleteMapping("/{commentId}")
    @RequirePermission("oa:doc:comment")
    public ApiResponse<Void> delete(@PathVariable Long commentId) {
        commentService.delete(commentId);
        return ApiResponse.success();
    }
}
