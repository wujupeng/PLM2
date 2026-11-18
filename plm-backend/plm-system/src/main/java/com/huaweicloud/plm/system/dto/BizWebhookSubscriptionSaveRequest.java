package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * Webhook 事件订阅保存入参（OA-DEV-087）。
 */
@Data
public class BizWebhookSubscriptionSaveRequest {

    private String subscriptionNo;

    private String subscriptionName;

    /** 事件类型：FLOW_COMPLETED/FLOW_REJECTED/DOC_PUBLISHED/USER_CHANGED。 */
    private String eventType;

    private String callbackUrl;

    private String secret;

    private String ownerSystem;

    private Integer maxRetry;

    private Integer status;

    private String remark;
}
