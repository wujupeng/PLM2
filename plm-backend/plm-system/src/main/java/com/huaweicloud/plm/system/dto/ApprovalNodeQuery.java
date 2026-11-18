package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批节点分页查询条件（G1-N6 WBS T103 可配置审批）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ApprovalNodeQuery extends PageQuery {

    /** 所属流程编码。 */
    private String flowCode;

    /** 节点名称。 */
    private String nodeName;

    /** 审批人类型：ROLE/USER/ORG。 */
    private String approverType;

    /** 审批方式：ANY/ALL。 */
    private String approveMode;

    /** 节点状态：ACTIVE/DISABLED。 */
    private String nodeStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
