package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserResponse {

    private Long userId;
    private String username;
    private String displayName;
    private String email;
    private String phone;
    private Long orgId;
    private String orgName;
    private Integer status;
    private List<Long> roleIds;
    private String remark;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
