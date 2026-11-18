package com.huaweicloud.plm.system.dto;

import lombok.Data;

@Data
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserInfoResponse userInfo;
}
