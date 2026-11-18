package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 治理里程碑分页查询条件（G1-N7 治理中心 T001 项目治理）。
 * keyword 匹配 milestoneNo/milestoneCode/milestoneName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovMilestoneQuery extends PageQuery {

    /** 所属项目编码。 */
    private String projectCode;

    /** 里程碑状态。 */
    private String milestoneStatus;
}
