package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 协作评论：针对各类业务对象的通用评论与回复。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_collab_comment")
public class OaOaCollabComment extends BaseEntity {

    private String bizType;

    private Long bizId;

    private String content;

    private Long authorUserId;

    private String authorName;

    private Long parentId;

    private String remark;
}
