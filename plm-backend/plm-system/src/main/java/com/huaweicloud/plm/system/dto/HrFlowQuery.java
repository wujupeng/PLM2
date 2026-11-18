package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 行政人事流程单分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class HrFlowQuery extends PageQuery {

    private String flowStatus;

    private Long applicantUserId;

    private Long orgId;

    private String startDate;

    private String endDate;
}
