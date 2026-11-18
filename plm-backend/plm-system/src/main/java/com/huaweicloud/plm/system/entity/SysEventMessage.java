package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * G1-N1 集成平台—事件消息（WBS T009）：记录每一次事件发布与投递结果，支持重试与死信标记。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_event_message")
public class SysEventMessage extends BaseEntity {

    /** 消息标识。 */
    private String messageKey;

    /** 事件主题编码。 */
    private String topicCode;

    /** 订阅编号。 */
    private String subscriptionCode;

    /** 业务类型。 */
    private String bizType;

    /** 业务ID。 */
    private String bizId;

    /** 事件载荷（映射数据库 TEXT 列）。 */
    private String payload;

    /** 消息状态：PENDING/SENT/FAILED/DEAD_LETTER。 */
    private String messageStatus;

    /** 已重试次数。 */
    private Integer retryCount;

    /** 最大重试次数。 */
    private Integer maxRetry;

    /** 下次重试时间。 */
    private LocalDateTime nextRetryAt;

    /** 发布时间。 */
    private LocalDateTime publishedAt;

    /** 投递时间。 */
    private LocalDateTime deliveredAt;

    /** 错误信息。 */
    private String errorMessage;

    /** 幂等键。 */
    private String idempotentKey;

    /** 是否进入死信：1 是，0 否。 */
    private Integer deadLetter;

    /** 操作人。 */
    private String operatorName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
