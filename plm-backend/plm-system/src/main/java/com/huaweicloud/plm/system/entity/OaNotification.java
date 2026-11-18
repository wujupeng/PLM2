package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 站内通知：统一承载流程待办、公告、系统消息、集成失败提醒与业务通知。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_notification")
public class OaNotification extends BaseEntity {

    private String notificationNo;

    private Long receiverUserId;

    private String receiverName;

    /** 消息类型：WORKFLOW/ANNOUNCEMENT/SYSTEM/INTEGRATION/BUSINESS。 */
    private String messageType;

    private String title;

    private String content;

    /** 关联业务对象类型，例如 OA_TASK / OA_PROCESS_INSTANCE / INT_EDI。 */
    private String bizType;

    private Long bizId;

    private String bizNo;

    private String linkUrl;

    private String priority;

    private Integer readFlag;

    /** 标记为未读时需要置空，故声明为始终更新。 */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private LocalDateTime readAt;

    private Integer archivedFlag;

    private String templateCode;

    /** 通知渠道：STATION/EMAIL/MOBILE/SMS/IM。 */
    private String channel;

    /** 发送状态：PENDING=待发送，SENT=已发送，FAILED=发送失败。 */
    private String sendStatus;

    private LocalDateTime sentAt;

    private String remark;
}
