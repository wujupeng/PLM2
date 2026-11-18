package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批流定义分页查询条件（G1-N6 WBS T103 可配置审批）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ApprovalFlowQuery extends PageQuery {

    /** 流程编码。 */
    private String flowCode;

    /** 流程名称。 */
    private String flowName;

    /** 单据类型。 */
    private String docType;

    /** 业务模块。 */
    private String bizModule;

    /** 流程状态：ACTIVE/DISABLED。 */
    private String flowStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
