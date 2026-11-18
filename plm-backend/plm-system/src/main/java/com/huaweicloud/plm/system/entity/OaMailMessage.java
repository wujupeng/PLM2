package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_mail_message")
public class OaMailMessage extends BaseEntity {

    private String messageNo;

    private String subject;

    /** 正文，支持纯文本与富文本 HTML 片段。 */
    private String content;

    /** 优先级：LOW/NORMAL/HIGH。 */
    private String priority;

    private Long senderUserId;

    private String senderName;

    /** 发件人部门快照，避免组织调整后历史邮件显示错乱。 */
    private String senderDept;

    /** 邮件状态：DRAFT=草稿，SENT=已发送。 */
    private String messageStatus;

    private Integer hasAttachment;

    private Integer senderStarFlag;

    private Integer senderDeletedFlag;

    /** 回复或转发时记录原始邮件 ID。 */
    private Long parentMessageId;

    /** 发送类型：NEW=新建，REPLY=回复，FORWARD=转发。 */
    private String sendType;

    private LocalDateTime sentAt;

    private String remark;
}
