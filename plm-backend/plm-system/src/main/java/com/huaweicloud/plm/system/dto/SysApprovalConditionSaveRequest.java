package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 审批条件保存请求（G1-N6 WBS T103 可配置审批）。
 */
@Data
public class SysApprovalConditionSaveRequest {

    /** 条件编号（为空时自动生成）。 */
    private String conditionNo;

    /** 所属流程编码。 */
    @NotBlank(message = "流程编码不能为空")
    private String flowCode;

    /** 判定顺序，为空默认 0。 */
    private Integer seqNo;

    /** 字段标识。 */
    @NotBlank(message = "字段标识不能为空")
    private String fieldKey;

    /** 比较符：EQ/NE/GT/GE/LT/LE/IN/BETWEEN，为空默认 EQ。 */
    private String compareOperator;

    /** 比较值。 */
    private String compareValue;

    /** 逻辑连接：AND/OR，为空默认 AND。 */
    private String logicType;

    /** 条件状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String conditionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
