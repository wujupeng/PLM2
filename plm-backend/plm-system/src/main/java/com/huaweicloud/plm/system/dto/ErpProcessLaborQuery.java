package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工艺资源—工时反馈分页查询条件（对应 G3-N7b ERP 工艺资源—工时反馈）。
 * keyword 匹配 feedbackNo/planNo/reportNo/resourceCode/operatorName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProcessLaborQuery extends PageQuery {

    /** 工时类型。 */
    private String laborType;

    /** 工时状态。 */
    private String laborStatus;

    /** 计划单号。 */
    private String planNo;
}
