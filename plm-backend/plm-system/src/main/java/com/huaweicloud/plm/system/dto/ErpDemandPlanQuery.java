package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 需求计划分页查询条件（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 * keyword 匹配 planNo/planName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpDemandPlanQuery extends PageQuery {

    /** 计划状态。 */
    private String planStatus;

    /** 计划类型。 */
    private String planType;

    /** 计划来源。 */
    private String planSource;

    /** 计划组织。 */
    private String planOrg;
}
