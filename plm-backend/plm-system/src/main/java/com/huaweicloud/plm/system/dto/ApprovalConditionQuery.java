package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批条件分页查询条件（G1-N6 WBS T103 可配置审批）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ApprovalConditionQuery extends PageQuery {

    /** 所属流程编码。 */
    private String flowCode;

    /** 字段标识。 */
    private String fieldKey;

    /** 比较符：EQ/NE/GT/GE/LT/LE/IN/BETWEEN。 */
    private String compareOperator;

    /** 逻辑连接：AND/OR。 */
    private String logicType;

    /** 条件状态：ACTIVE/DISABLED。 */
    private String conditionStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
