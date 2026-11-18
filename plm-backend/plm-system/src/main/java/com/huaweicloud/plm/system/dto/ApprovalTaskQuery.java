package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批任务分页查询条件（G1-N6 WBS T103 可配置审批）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ApprovalTaskQuery extends PageQuery {

    /** 所属实例编号。 */
    private String instanceNo;

    /** 所属节点编号。 */
    private String nodeNo;

    /** 审批人姓名。 */
    private String approverName;

    /** 任务状态：PENDING/APPROVED/REJECTED/TRANSFERRED。 */
    private String taskStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
