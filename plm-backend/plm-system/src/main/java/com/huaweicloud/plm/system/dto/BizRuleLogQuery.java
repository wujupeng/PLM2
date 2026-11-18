package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 规则执行日志分页查询条件（G1-N6 WBS T104 业务规则引擎）。
 * startDate/endDate 作用于执行时间（execTime）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BizRuleLogQuery extends PageQuery {

    /** 规则编码。 */
    private String ruleCode;

    /** 业务模块。 */
    private String bizModule;

    /** 业务主键。 */
    private String bizKey;

    /** 命中结果：MATCH/NOT_MATCH/ERROR。 */
    private String matchResult;

    /** 起始日期（yyyy-MM-dd），作用于执行时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于执行时间。 */
    private String endDate;
}
