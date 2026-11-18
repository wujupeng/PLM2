package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 协同评论保存入参。
 */
@Data
public class CollabCommentSaveRequest {

    private String bizType;

    private Long bizId;

    private String content;

    private Long parentId;
}
