package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 数据校验规则记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_collect_rule")
public class MesCollectRule extends BaseEntity {

    /** 规则编号。 */
    private String ruleNo;

    /** 规则名称。 */
    private String ruleName;

    /** 数据点编码。 */
    private String pointCode;

    /** 校验类型，默认 RANGE。 */
    private String ruleType;

    /** 最小值。 */
    private BigDecimal minValue;

    /** 最大值。 */
    private BigDecimal maxValue;

    /** 校验表达式。 */
    private String expression;

    /** 时间戳容差（秒）。 */
    private Integer timestampTolerance;

    /** 处理动作，默认 WARN。 */
    private String ruleAction;

    /** 规则状态，默认 DRAFT。 */
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
