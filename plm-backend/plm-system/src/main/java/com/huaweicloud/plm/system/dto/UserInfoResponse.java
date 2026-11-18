package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 登录用户信息，与前端 UserInfo 结构保持一致。
 */
@Data
public class UserInfoResponse {

    private Long userId;
    private String username;
    private String displayName;
    private List<String> roles;
    private List<String> permissions;
    private Long orgId;
    private String organization;
    private String avatar;
}
