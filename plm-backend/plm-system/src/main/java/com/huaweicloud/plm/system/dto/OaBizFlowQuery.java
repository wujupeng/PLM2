package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * OA-N7 业务流程单分页查询条件。
 * typeCode 为通用业务类型筛选（如传票类型、指标类型、通知类型、试流类型等），未使用时忽略。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class OaBizFlowQuery extends PageQuery {

    private String flowStatus;

    private Long applicantUserId;

    private Long orgId;

    private String startDate;

    private String endDate;

    private String typeCode;
}
