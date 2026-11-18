package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 审批流定义保存请求（G1-N6 WBS T103 可配置审批）。
 */
@Data
public class SysApprovalFlowSaveRequest {

    /** 审批流编号（为空时自动生成）。 */
    private String flowNo;

    /** 流程编码。 */
    private String flowCode;

    /** 流程名称。 */
    @NotBlank(message = "流程名称不能为空")
    private String flowName;

    /** 单据类型。 */
    @NotBlank(message = "单据类型不能为空")
    private String docType;

    /** 业务模块。 */
    private String bizModule;

    /** 条件表达式（可读文本）。 */
    private String conditionExpr;

    /** 优先级，为空默认 0。 */
    private Integer priority;

    /** 流程状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String flowStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
