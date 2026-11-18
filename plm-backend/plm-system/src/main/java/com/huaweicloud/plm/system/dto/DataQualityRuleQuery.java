package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 数据质量规则分页查询条件（G1-N6 WBS T105 数据质量控制）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DataQualityRuleQuery extends PageQuery {

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 目标实体。 */
    private String targetEntity;

    /** 规则类型：REQUIRED/UNIQUE/CODE_PATTERN/VALIDITY/VERSION_CONSISTENCY/REFERENCE。 */
    private String ruleType;

    /** 异常级别：ERROR/WARN。 */
    private String errorLevel;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
