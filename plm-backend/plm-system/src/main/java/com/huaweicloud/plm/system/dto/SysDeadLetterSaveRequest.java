package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 死信队列保存请求（G1-N1 集成平台）。
 */
@Data
public class SysDeadLetterSaveRequest {

    /** 死信编号。 */
    private String letterNo;

    /** 消息标识。 */
    @NotBlank(message = "消息标识不能为空")
    private String messageKey;

    /** 事件主题编码。 */
    private String topicCode;

    /** 订阅方系统编码。 */
    private String subscriberSystem;

    /** 事件载荷。 */
    private String payload;

    /** 失败原因。 */
    private String failReason;

    /** 已重试次数。 */
    private Integer retryCount;

    /** 死信状态：PENDING/HANDLED/IGNORED。 */
    private String deadStatus;

    /** 处理人。 */
    private String handlerName;

    /** 处理时间（yyyy-MM-dd HH:mm:ss）。 */
    private String handledAt;

    /** 处理结果。 */
    private String handleResult;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
