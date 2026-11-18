package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocFolderPermissionItem {

    private Long id;

    private Long folderId;

    private String subjectType;

    private Long subjectId;

    /** 授权对象显示名：角色名/组织名/用户名，ALL 为「所有人」。 */
    private String subjectName;

    private String permissionLevel;

    private Integer inheritFlag;

    private String remark;

    private LocalDateTime createdAt;
}
