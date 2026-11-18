package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * MRP/LRP 运算批次分页查询条件（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 * keyword 匹配 runNo/runBy。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpMrpRunQuery extends PageQuery {

    /** 运算类型。 */
    private String runType;

    /** 运算范围。 */
    private String runScope;

    /** 运算状态。 */
    private String runStatus;

    /** 关联需求计划号。 */
    private String planNo;
}
