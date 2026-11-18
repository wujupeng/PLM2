package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 单据状态流转规则分页查询条件（G1-N6 WBS T102 单据状态机）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocTransitionQuery extends PageQuery {

    /** 单据类型。 */
    private String docType;

    /** 起始状态编码。 */
    private String fromState;

    /** 目标状态编码。 */
    private String toState;

    /** 动作编码。 */
    private String actionCode;

    /** 流转类型：FORWARD 正向/REVERSE 反向。 */
    private String transitionType;

    /** 流转状态：ACTIVE/DISABLED。 */
    private String transitionStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
