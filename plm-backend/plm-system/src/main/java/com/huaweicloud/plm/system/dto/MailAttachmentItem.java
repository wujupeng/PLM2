package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/** 邮件附件明细（含下载与迁移核对所需元数据）。 */
@Data
public class MailAttachmentItem {

    private Long attachmentId;

    private String fileName;

    private Long fileSize;

    private String contentType;

    private String fileHash;

    /** 扫描状态：PENDING/CLEAN/INFECTED。 */
    private String scanStatus;

    private LocalDateTime scanAt;

    private LocalDateTime createdAt;
}
