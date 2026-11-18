package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 数据校验规则记录保存请求。
 */
@Data
public class MesCollectRuleSaveRequest {

    /** 规则编号（为空时自动生成）。 */
    private String ruleNo;

    /** 规则名称。 */
    private String ruleName;

    /** 数据点编码。 */
    @NotBlank(message = "数据点编码不能为空")
    private String pointCode;

    /** 校验类型，为空默认 RANGE。 */
    private String ruleType;

    /** 最小值。 */
    private BigDecimal minValue;

    /** 最大值。 */
    private BigDecimal maxValue;

    /** 校验表达式。 */
    private String expression;

    /** 时间戳容差（秒）。 */
    private Integer timestampTolerance;

    /** 处理动作，为空默认 WARN。 */
    private String ruleAction;

    /** 规则状态，为空默认 DRAFT。 */
    private String ruleStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
