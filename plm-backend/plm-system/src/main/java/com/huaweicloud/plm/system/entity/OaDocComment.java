package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 文档评论：支持回复与 @提醒。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_doc_comment")
public class OaDocComment extends BaseEntity {

    private Long docId;

    private Long versionId;

    private Long parentCommentId;

    private String content;

    /** 被 @ 的用户ID，逗号分隔。 */
    private String mentionUserIds;

    private Long authorUserId;

    private String authorName;

    private String status;

    private String remark;
}
