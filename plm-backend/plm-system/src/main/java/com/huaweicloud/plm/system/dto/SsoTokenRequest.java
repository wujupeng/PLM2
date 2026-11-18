package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * SSO 令牌申请：支持 client_credentials（以客户端身份换取）与 password（以用户身份换取）。
 */
@Data
public class SsoTokenRequest {

    /** client_credentials / password。 */
    @NotBlank(message = "授权类型不能为空")
    private String grantType;

    private String clientId;

    private String clientSecret;

    private String username;

    private String password;
}
