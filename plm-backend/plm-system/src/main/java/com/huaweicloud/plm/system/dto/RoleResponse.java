package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoleResponse {

    private Long roleId;
    private String roleCode;
    private String roleName;
    private String dataScope;
    private Integer status;
    private String remark;
    private LocalDateTime createdAt;
}
