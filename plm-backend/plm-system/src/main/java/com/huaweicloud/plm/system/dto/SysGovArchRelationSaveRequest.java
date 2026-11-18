package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 架构关系保存请求（G1-N7 WBS T005 总体架构）。
 */
@Data
public class SysGovArchRelationSaveRequest {

    /** 关系编号（为空时自动生成）。 */
    private String relationNo;

    /** 源组件（组件编号）。 */
    @NotBlank(message = "源组件不能为空")
    private String sourceComponent;

    /** 目标组件（组件编号）。 */
    @NotBlank(message = "目标组件不能为空")
    private String targetComponent;

    /** 关系类型：CALL/DEPEND/...，为空默认 CALL。 */
    private String relationType;

    /** 协议。 */
    private String protocol;

    /** 关系说明。 */
    private String relationDesc;

    /** 关系状态，为空默认 ACTIVE。 */
    private String relationStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
