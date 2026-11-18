package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 接口调用日志（N9，DEV-096）：幂等键唯一，记录请求/响应、重试与补偿情况，支撑接口监控。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_interface_log")
public class IntInterfaceLog extends BaseEntity {

    /** 日志编号（唯一）。 */
    private String logNo;

    /** 接口编码。 */
    private String endpointCode;

    /** 业务接口代码。 */
    private String interfaceCode;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 业务键（如物料编码、工单号）。 */
    private String bizKey;

    /** 幂等键（唯一）。 */
    private String idempotentKey;

    /** 请求报文。 */
    private String requestBody;

    /** 请求摘要。 */
    private String requestHash;

    /** 响应报文。 */
    private String responseBody;

    /** HTTP 状态码。 */
    private Integer httpStatus;

    /** 结果状态：SUCCESS/FAILED/RETRYING/COMPENSATED。 */
    private String resultStatus;

    /** 已重试次数。 */
    private Integer retryCount;

    /** 最大重试次数。 */
    private Integer retryMax;

    /** 下次重试时间。 */
    private LocalDateTime nextRetryAt;

    /** 是否已补偿：1 已补偿 / 0 未补偿。 */
    private Integer compensated;

    /** 错误信息。 */
    private String errorMessage;

    /** 来源系统。 */
    private String sourceSystem;

    /** 目标系统。 */
    private String targetSystem;

    /** 耗时（毫秒）。 */
    private Long costMs;

    /** 操作人。 */
    private String operator;

    private String remark;
}
