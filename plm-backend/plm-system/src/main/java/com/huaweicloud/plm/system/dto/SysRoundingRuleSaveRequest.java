package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 舍入规则保存请求（G1-N5 公共平台底座—多币种多税率 WBS T101）。
 */
@Data
public class SysRoundingRuleSaveRequest {

    /** 规则编号（为空时自动生成）。 */
    private String ruleNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    @NotBlank(message = "规则名称不能为空")
    private String ruleName;

    /** 舍入对象：PRICE/AMOUNT/TAX/QTY。 */
    private String roundingTarget;

    /** 舍入方式：HALF_UP/HALF_EVEN/UP/DOWN。 */
    private String roundingMode;

    /** 舍入单位。 */
    private BigDecimal roundingUnit;

    /** 精度小数位。 */
    private Integer precisionDigits;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
