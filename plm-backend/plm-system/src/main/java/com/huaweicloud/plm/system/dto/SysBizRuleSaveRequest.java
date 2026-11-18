package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 业务规则定义保存请求（G1-N6 WBS T104 业务规则引擎）。
 */
@Data
public class SysBizRuleSaveRequest {

    /** 规则编号（为空时自动生成）。 */
    private String ruleNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    @NotBlank(message = "规则名称不能为空")
    private String ruleName;

    /** 规则类型：LEAD_TIME/MOQ/LOT_SIZE/SUBSTITUTE/FIFO/QUALITY_RELEASE/CREDIT_LIMIT，为空默认 LEAD_TIME。 */
    @NotBlank(message = "规则类型不能为空")
    private String ruleType;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 规则表达式（可读文本）。 */
    private String ruleExpr;

    /** 优先级，数值越小越优先，为空默认 100。 */
    private Integer priority;

    /** 规则状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String ruleStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
