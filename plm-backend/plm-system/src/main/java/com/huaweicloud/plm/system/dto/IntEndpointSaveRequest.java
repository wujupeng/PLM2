package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 接口配置保存请求（N9，DEV-096）。 */
@Data
public class IntEndpointSaveRequest {

    /** 接口编码（可选，留空自动生成）。 */
    private String endpointCode;

    /** 接口名称。 */
    private String endpointName;

    @NotBlank(message = "所属域不能为空")
    private String domain;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 协议：REST/SOAP/FILE/MQ。 */
    private String protocol;

    /** 接口地址。 */
    private String endpointUrl;

    /** 认证方式。 */
    private String authType;

    /** 超时（毫秒）。 */
    private Integer timeoutMs;

    /** 最大重试次数。 */
    private Integer retryMax;

    /** 是否启用幂等：1 启用 / 0 关闭。 */
    private Integer idempotentEnabled;

    /** 是否启用补偿：1 启用 / 0 关闭。 */
    private Integer compensateEnabled;

    /** 状态：enabled/disabled。 */
    private String status;

    private String remark;
}
