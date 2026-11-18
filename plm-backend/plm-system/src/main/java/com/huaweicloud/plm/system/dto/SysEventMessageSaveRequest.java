package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 事件消息保存请求（G1-N1 集成平台）。
 */
@Data
public class SysEventMessageSaveRequest {

    /** 消息标识。 */
    private String messageKey;

    /** 事件主题编码。 */
    @NotBlank(message = "事件主题不能为空")
    private String topicCode;

    /** 订阅编号。 */
    private String subscriptionCode;

    /** 业务类型。 */
    private String bizType;

    /** 业务ID。 */
    private String bizId;

    /** 事件载荷。 */
    private String payload;

    /** 消息状态：PENDING/SENT/FAILED/DEAD_LETTER。 */
    private String messageStatus;

    /** 已重试次数。 */
    private Integer retryCount;

    /** 最大重试次数。 */
    private Integer maxRetry;

    /** 下次重试时间（yyyy-MM-dd HH:mm:ss）。 */
    private String nextRetryAt;

    /** 发布时间（yyyy-MM-dd HH:mm:ss）。 */
    private String publishedAt;

    /** 投递时间（yyyy-MM-dd HH:mm:ss）。 */
    private String deliveredAt;

    /** 错误信息。 */
    private String errorMessage;

    /** 幂等键。 */
    private String idempotentKey;

    /** 是否进入死信：1 是，0 否。 */
    private Integer deadLetter;

    /** 操作人。 */
    private String operatorName;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
