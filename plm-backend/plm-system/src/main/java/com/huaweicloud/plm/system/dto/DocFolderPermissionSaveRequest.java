package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DocFolderPermissionSaveRequest {

    @NotBlank(message = "授权对象类型不能为空")
    private String subjectType;

    /** 授权对象标识：ALL 可空，DEPT 为组织ID，ROLE 为角色ID，USER 为用户ID。 */
    private Long subjectId;

    @NotBlank(message = "权限级别不能为空")
    private String permissionLevel;

    private Integer inheritFlag;

    private String remark;
}
