package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * Webhook 投递记录入参（OA-DEV-087）。
 */
@Data
public class BizWebhookDeliverySaveRequest {

    private Long subscriptionId;

    private String eventType;

    private String eventId;

    private String payload;

    /** 投递状态：PENDING/SUCCESS/FAILED/DEAD。 */
    private String deliveryStatus;

    private Integer responseCode;

    private String lastError;

    private String receiptNo;

    private String remark;
}
