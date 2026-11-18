package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 接口注册中心保存请求（G1-N1 集成平台 T009）。
 */
@Data
public class SysApiRegistrySaveRequest {

    /** 接口编码（为空时自动生成）。 */
    private String apiCode;

    /** 接口名称。 */
    @NotBlank(message = "接口名称不能为空")
    private String apiName;

    /** 所属系统编码。 */
    @NotBlank(message = "所属系统不能为空")
    private String systemCode;

    /** 交互方向：IN/OUT/BOTH。 */
    private String direction;

    /** 协议：HTTP/DUBBO/DB/MQ/FILE/EDI。 */
    private String protocol;

    /** HTTP 方法：GET/POST/PUT/DELETE。 */
    private String httpMethod;

    /** 接口路径。 */
    private String urlPath;

    /** 接口版本。 */
    private String apiVersion;

    /** 认证方式：JWT/API_KEY/OAUTH2/MTLS/NONE。 */
    private String authType;

    /** 超时时间（毫秒）。 */
    private Integer timeoutMs;

    /** SLA 时长（毫秒）。 */
    private Integer slaMs;

    /** 责任人。 */
    private String ownerName;

    /** 接口状态：DRAFT/ACTIVE/DEPRECATED/OFFLINE。 */
    private String apiStatus;

    /** 接口说明。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
