package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 接口调用日志登记请求（N9，DEV-096）。 */
@Data
public class IntInterfaceLogSaveRequest {

    /** 接口编码。 */
    private String endpointCode;

    /** 业务接口代码。 */
    private String interfaceCode;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 业务键（如物料编码、工单号）。 */
    private String bizKey;

    @NotBlank(message = "幂等键不能为空")
    private String idempotentKey;

    /** 请求报文。 */
    private String requestBody;

    /** 响应报文。 */
    private String responseBody;

    /** HTTP 状态码。 */
    private Integer httpStatus;

    /** 结果状态：SUCCESS/FAILED/RETRYING/COMPENSATED。 */
    private String resultStatus;

    /** 最大重试次数。 */
    private Integer retryMax;

    /** 错误信息。 */
    private String errorMessage;

    /** 来源系统。 */
    private String sourceSystem;

    /** 目标系统。 */
    private String targetSystem;

    /** 耗时（毫秒）。 */
    private Long costMs;

    private String remark;
}
