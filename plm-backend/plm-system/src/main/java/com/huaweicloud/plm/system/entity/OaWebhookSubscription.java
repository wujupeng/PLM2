package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Webhook 事件订阅（OA-DEV-087）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_webhook_subscription")
public class OaWebhookSubscription extends BaseEntity {

    /** 订阅编号。 */
    private String subscriptionNo;

    /** 订阅名称。 */
    private String subscriptionName;

    /** 事件类型：FLOW_COMPLETED/FLOW_REJECTED/DOC_PUBLISHED/USER_CHANGED。 */
    private String eventType;

    /** 回调地址。 */
    private String callbackUrl;

    /** 签名密钥。 */
    private String secret;

    /** 所属系统。 */
    private String ownerSystem;

    /** 最大重试次数。 */
    private Integer maxRetry;

    /** 状态：0 停用 / 1 启用。 */
    private Integer status;

    /** 最近投递时间。 */
    private LocalDateTime lastDeliveryTime;

    /** 最近投递状态。 */
    private String lastDeliveryStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
