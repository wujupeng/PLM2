package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Webhook 投递记录（OA-DEV-087，含签名、重试与死信）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_webhook_delivery")
public class OaWebhookDelivery extends BaseEntity {

    /** 订阅ID。 */
    private Long subscriptionId;

    /** 订阅编号。 */
    private String subscriptionNo;

    /** 事件类型。 */
    private String eventType;

    /** 事件ID。 */
    private String eventId;

    /** 载荷。 */
    private String payload;

    /** 投递状态：PENDING/SUCCESS/FAILED/DEAD。 */
    private String deliveryStatus;

    /** 已尝试次数。 */
    private Integer attemptCount;

    /** 最大重试次数。 */
    private Integer maxRetry;

    /** 响应状态码。 */
    private Integer responseCode;

    /** 最近错误。 */
    private String lastError;

    /** 下次重试时间。 */
    private LocalDateTime nextRetryTime;

    /** 是否死信：0/1。 */
    private Integer deadFlag;

    /** 回执号。 */
    private String receiptNo;

    /** 投递时间。 */
    private LocalDateTime deliveryTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
