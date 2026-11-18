package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 单据状态定义分页查询条件（G1-N6 WBS T102 单据状态机）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocStateQuery extends PageQuery {

    /** 单据类型。 */
    private String docType;

    /** 状态编码。 */
    private String stateCode;

    /** 状态类型：DRAFT/SUBMITTED/APPROVED/EXECUTING/CLOSED/VOID/REVERSED。 */
    private String stateType;

    /** 状态：ACTIVE/DISABLED。 */
    private String stateStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
