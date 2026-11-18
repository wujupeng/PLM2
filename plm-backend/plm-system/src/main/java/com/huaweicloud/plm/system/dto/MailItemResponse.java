package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/** 邮件列表行：按文件夹维度聚合发件人视图与收件人视图。 */
@Data
public class MailItemResponse {

    private Long messageId;

    private String messageNo;

    private String subject;

    /** 正文摘要，供列表预览。 */
    private String preview;

    private String priority;

    /** 邮件状态：DRAFT/SENT。 */
    private String messageStatus;

    private String senderName;

    private String senderDept;

    private Integer hasAttachment;

    private Integer readFlag;

    private Integer starFlag;

    /** 收件人显示串（多个以逗号分隔）。 */
    private String recipientSummary;

    /** 所在文件夹（收件人为收件人侧文件夹，发件人为 SENT/DRAFT）。 */
    private String folderCode;

    private LocalDateTime sentAt;

    private LocalDateTime createdAt;
}
