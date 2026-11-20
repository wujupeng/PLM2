package com.huaweicloud.plm.common.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT 配置项，统一从 plm.jwt 前缀读取。
 */
@Data
@Component
@ConfigurationProperties(prefix = "plm.jwt")
public class JwtProperties {

    /** 签名密钥，必须由环境配置注入。 */
    private String secret;

    /** 访问令牌有效期（秒）。 */
    private long accessTokenExpiration = 3600;

    /** 刷新令牌有效期（秒）。 */
    private long refreshTokenExpiration = 86400;

    /** 签发者。 */
    private String issuer = "plm-system";
}
