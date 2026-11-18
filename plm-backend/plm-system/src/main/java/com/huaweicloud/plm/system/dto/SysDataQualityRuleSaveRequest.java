package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 数据质量规则保存请求（G1-N6 WBS T105 数据质量控制）。
 */
@Data
public class SysDataQualityRuleSaveRequest {

    /** 规则编号（为空时自动生成）。 */
    private String ruleNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    @NotBlank(message = "规则名称不能为空")
    private String ruleName;

    /** 目标实体。 */
    @NotBlank(message = "目标实体不能为空")
    private String targetEntity;

    /** 规则类型：REQUIRED/UNIQUE/CODE_PATTERN/VALIDITY/VERSION_CONSISTENCY/REFERENCE，为空默认 REQUIRED。 */
    private String ruleType;

    /** 校验表达式（可读文本）。 */
    private String ruleExpr;

    /** 异常级别：ERROR/WARN，为空默认 ERROR。 */
    private String errorLevel;

    /** 规则状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String ruleStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
