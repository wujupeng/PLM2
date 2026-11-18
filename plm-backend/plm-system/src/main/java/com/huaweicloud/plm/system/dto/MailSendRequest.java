package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/**
 * 写信请求：新建、回复、转发共用；draftFlag=true 时保存为草稿。
 */
@Data
public class MailSendRequest {

    private String subject;

    private String content;

    /** 优先级：LOW/NORMAL/HIGH。 */
    private String priority;

    /** 收件人。 */
    private List<Long> recipientUserIds;

    /** 抄送人。 */
    private List<Long> ccUserIds;

    /** 密送人。 */
    private List<Long> bccUserIds;

    /** 已上传的附件 ID 列表。 */
    private List<Long> attachmentIds;

    /** 是否保存为草稿：true=草稿，false 或不传=直接发送。 */
    private Boolean draftFlag;

    /** 编辑既有草稿时传入草稿邮件 ID，发送时传 draftFlag=false 即可转正。 */
    private Long draftId;

    /** 回复或转发时的原始邮件 ID。 */
    private Long parentMessageId;

    /** 发送类型：NEW=新建，REPLY=回复，FORWARD=转发。 */
    @NotBlank(message = "发送类型不能为空")
    private String sendType;

    private String remark;
}
