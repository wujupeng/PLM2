package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文档评论展示项：包含回复关系与被 @ 用户，供前端展示与提醒。
 */
@Data
public class DocCommentItem {

    private Long id;

    private Long docId;

    private Long versionId;

    private Long parentCommentId;

    private String content;

    /** 被 @ 的用户ID，逗号分隔。 */
    private String mentionUserIds;

    private Long authorUserId;

    private String authorName;

    private String status;

    private LocalDateTime createdAt;
}
