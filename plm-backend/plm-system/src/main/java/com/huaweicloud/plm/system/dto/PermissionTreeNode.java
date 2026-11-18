package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PermissionTreeNode {

    private Long permissionId;
    private String permissionCode;
    private String permissionName;
    private String permissionType;
    private Long parentId;
    private String path;
    private String icon;
    private Integer sortNo;
    private Integer status;
    private List<PermissionTreeNode> children = new ArrayList<>();
}
