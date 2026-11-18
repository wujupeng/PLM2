package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SsoClientSaveRequest {

    @NotBlank(message = "客户端 ID 不能为空")
    private String clientId;

    /** 留空表示不修改既有密钥。 */
    private String clientSecret;

    @NotBlank(message = "客户端名称不能为空")
    private String clientName;

    private String redirectUri;

    private String grantTypes;

    private String scopes;

    private Integer tokenTtlSeconds;

    private String status;

    private String remark;
}
