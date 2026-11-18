package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 计划调整分页查询条件（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 * keyword 匹配 adjustmentNo/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPlanAdjustmentQuery extends PageQuery {

    /** 调整状态。 */
    private String adjustmentStatus;

    /** 调整类型。 */
    private String adjustmentType;

    /** 物料编码。 */
    private String materialCode;

    /** 关联需求计划号。 */
    private String planNo;
}
