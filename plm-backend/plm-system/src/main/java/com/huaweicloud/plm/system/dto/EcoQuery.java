package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工程变更单（ECO）分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EcoQuery extends PageQuery {

    /** 变更单编号。 */
    private String ecoNo;

    /** 来源变更申请编号。 */
    private String ecrNo;

    /** 审批状态：draft/submitted/approved/rejected。 */
    private String approvalStatus;

    /** 执行状态：pending/executing/completed。 */
    private String executionStatus;
}
