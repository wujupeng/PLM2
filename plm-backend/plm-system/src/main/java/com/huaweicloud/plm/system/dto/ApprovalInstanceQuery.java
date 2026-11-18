package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批实例分页查询条件（G1-N6 WBS T103 可配置审批）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ApprovalInstanceQuery extends PageQuery {

    /** 所属流程编码。 */
    private String flowCode;

    /** 单据类型。 */
    private String docType;

    /** 单据编号。 */
    private String docNo;

    /** 实例状态：PENDING/APPROVED/REJECTED/CANCELED。 */
    private String instanceStatus;

    /** 提交人姓名。 */
    private String submitterName;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
