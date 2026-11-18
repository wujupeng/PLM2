package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 单据状态流转日志分页查询条件（G1-N6 WBS T102 单据状态机）。
 * startDate/endDate 作用于操作时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocStateLogQuery extends PageQuery {

    /** 单据类型。 */
    private String docType;

    /** 单据号。 */
    private String docNo;

    /** 变更后状态编码。 */
    private String toState;

    /** 动作编码。 */
    private String actionCode;

    /** 操作人姓名。 */
    private String operatorName;

    /** 起始日期（yyyy-MM-dd），作用于操作时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于操作时间。 */
    private String endDate;
}
