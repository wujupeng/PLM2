package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 舍入规则（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 登记舍入对象（单价/金额/税额/数量）、舍入方式与舍入单位，
 * 含税/未税换算与金额计算一律调用统一舍入规则。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_rounding_rule")
public class SysRoundingRule extends BaseEntity {

    /** 规则编号（唯一，支持人工指定）。 */
    private String ruleNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
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

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
