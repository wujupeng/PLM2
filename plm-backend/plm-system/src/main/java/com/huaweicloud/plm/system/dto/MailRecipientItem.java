package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/** 收件人明细：读、星标与所属文件夹状态按收件人独立展示。 */
@Data
public class MailRecipientItem {

    private Long recipientId;

    private Long recipientUserId;

    private String recipientName;

    /** 收件类型：TO/CC/BCC。 */
    private String recipientType;

    private Integer readFlag;

    private LocalDateTime readAt;

    private Integer starFlag;

    private Integer deletedFlag;

    private String folderCode;
}
