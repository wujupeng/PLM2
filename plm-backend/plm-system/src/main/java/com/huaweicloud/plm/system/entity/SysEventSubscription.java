package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * G1-N1 集成平台—事件订阅（WBS T009）：声明下游系统对事件主题的订阅关系、投递方式与重试策略。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_event_subscription")
public class SysEventSubscription extends BaseEntity {

    /** 订阅编号。 */
    private String subscriptionCode;

    /** 事件主题编码。 */
    private String topicCode;

    /** 事件主题名称。 */
    private String topicName;

    /** 订阅方系统编码。 */
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

    /** 最近联通测试时间。 */
    private LocalDateTime lastTestTime;

    /** 操作人。 */
    private String operatorName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
