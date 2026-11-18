package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * G1-N1 集成平台—死信队列（WBS T009）：投递超过最大重试次数的事件进入死信，由人工处理或忽略。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_dead_letter")
public class SysDeadLetter extends BaseEntity {

    /** 死信编号。 */
    private String letterNo;

    /** 消息标识。 */
    private String messageKey;

    /** 事件主题编码。 */
    private String topicCode;

    /** 订阅方系统编码。 */
    private String subscriberSystem;

    /** 事件载荷（映射数据库 TEXT 列）。 */
    private String payload;

    /** 失败原因。 */
    private String failReason;

    /** 已重试次数。 */
    private Integer retryCount;

    /** 死信状态：PENDING/HANDLED/IGNORED。 */
    private String deadStatus;

    /** 处理人。 */
    private String handlerName;

    /** 处理时间。 */
    private LocalDateTime handledAt;

    /** 处理结果。 */
    private String handleResult;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
