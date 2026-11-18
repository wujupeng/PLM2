package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class OrgTreeNode {

    private Long orgId;
    private String orgCode;
    private String orgName;
    private Long parentId;
    private String orgType;
    private Integer sortNo;
    private Integer status;
    private List<OrgTreeNode> children = new ArrayList<>();
}
