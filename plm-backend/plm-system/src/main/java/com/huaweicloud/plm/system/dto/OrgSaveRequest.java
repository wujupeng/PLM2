package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrgSaveRequest {

    @NotBlank(message = "组织编码不能为空")
    private String orgCode;

    @NotBlank(message = "组织名称不能为空")
    private String orgName;

    /** 顶级组织传 0 或不传。 */
    private Long parentId;

    private String orgType;

    private Integer sortNo;

    private Integer status;

    private String remark;
}
