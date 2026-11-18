package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 数据校验规则记录分页查询条件。
 * keyword 匹配 ruleNo/ruleName/pointCode/expression。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesCollectRuleQuery extends PageQuery {

    /** 校验类型。 */
    private String ruleType;

    /** 处理动作。 */
    private String ruleAction;

    /** 规则状态。 */
    private String ruleStatus;

    /** 数据点编码。 */
    private String pointCode;
}
