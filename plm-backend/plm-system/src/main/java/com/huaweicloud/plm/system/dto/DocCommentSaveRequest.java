package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 文档评论入参：支持针对指定版本与指定父评论。
 */
@Data
public class DocCommentSaveRequest {

    @NotBlank(message = "评论内容不能为空")
    private String content;

    private Long versionId;

    private Long parentCommentId;

    /** 被 @ 的用户ID，逗号分隔。 */
    private String mentionUserIds;

    private String remark;
}
