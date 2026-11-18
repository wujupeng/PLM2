package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocVersionItem {

    private Long versionId;

    private Long docId;

    private Integer versionNo;

    private String revisionNote;

    private String fileName;

    private Long fileSize;

    private String contentType;

    private String fileHash;

    private String scanStatus;

    private Integer publishedFlag;

    private Integer currentFlag;

    private Integer lockFlag;

    private Long uploadedByUserId;

    private String uploadedByName;

    private LocalDateTime createdAt;
}
