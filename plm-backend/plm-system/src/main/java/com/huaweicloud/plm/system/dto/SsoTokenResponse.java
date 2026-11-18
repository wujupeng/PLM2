package com.huaweicloud.plm.system.dto;

import lombok.Data;

@Data
public class SsoTokenResponse {

    private String accessToken;

    private String tokenType = "Bearer";

    private Long expiresIn;

    private String scope;

    private String username;

    private String displayName;
}
