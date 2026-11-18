package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 事件订阅保存请求（G1-N1 集成平台）。
 */
@Data
public class SysEventSubscriptionSaveRequest {

    /** 订阅编号。 */
    private String subscriptionCode;

    /** 事件主题编码。 */
    @NotBlank(message = "事件主题不能为空")
    private String topicCode;

    /** 事件主题名称。 */
    private String topicName;

    /** 订阅方系统编码。 */
    @NotBlank(message = "订阅系统不能为空")
    private String subscriberSystem;

    /** 投递端点。 */
    private String endpoint;

    /** 投递方式：PUSH/PULL。 */
    private String deliveryMode;

    /** 最大重试次数。 */
    private Integer maxRetry;

    /** 重试间隔（秒）。 */
    private Integer retryIntervalSec;

    /** 是否开启幂等：1 是，0 否。 */
    private Integer idempotentEnabled;

    /** 订阅状态：ENABLED/DISABLED。 */
    private String subscriptionStatus;

    /** 最近联通测试结果。 */
    private String lastTestResult;

    /** 最近联通测试时间（yyyy-MM-dd HH:mm:ss）。 */
    private String lastTestTime;

    /** 操作人。 */
    private String operatorName;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
