package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 规则参数分页查询条件（G1-N6 WBS T104 业务规则引擎）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BizRuleParamQuery extends PageQuery {

    /** 所属规则编码。 */
    private String ruleCode;

    /** 参数键。 */
    private String paramKey;

    /** 值类型：STRING/NUMBER/BOOLEAN/LIST。 */
    private String valueType;

    /** 参数状态：ACTIVE/DISABLED。 */
    private String paramStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
