package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 统一检索结果项：仅返回当前用户有权访问的内容（OA-DEV-052 权限过滤）。
 */
@Data
public class DocSearchItem {

    private Long indexId;

    /** 来源类型：DOCUMENT/MAIL。 */
    private String sourceType;

    private Long sourceId;

    private String bizNo;

    private String title;

    /** 命中的内容片段。 */
    private String snippet;

    private String keywords;

    private Long folderId;

    private Long docId;

    private Long ownerUserId;

    private LocalDateTime indexedAt;
}
