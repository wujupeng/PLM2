package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocItem {

    private Long id;

    private String docNo;

    private String title;

    private Long folderId;

    private String folderName;

    private String docType;

    private String status;

    private String sourceType;

    private Long sourceBizId;

    private String sourceBizNo;

    private Long ownerUserId;

    private String ownerName;

    private Long ownerDeptId;

    private String ownerDeptName;

    private Long currentVersionId;

    private Integer currentVersionNo;

    private String fileName;

    private Long fileSize;

    private String contentType;

    private String summary;

    private String keywords;

    private String tags;

    private LocalDateTime publishedAt;

    private Integer archivedFlag;

    private Long viewCount;

    private Long downloadCount;

    private Integer lockFlag;

    private String extJson;

    private String remark;

    /** 当前用户对该文档的有效权限级别：READ/WRITE/MANAGE。 */
    private String effectivePermission;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
