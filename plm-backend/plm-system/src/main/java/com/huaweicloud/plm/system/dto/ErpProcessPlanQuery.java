package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工序计划分页查询条件（对应 G3-N7b ERP 工艺资源）。
 * keyword 匹配 planNo/productionOrderNo/materialCode/operationName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProcessPlanQuery extends PageQuery {

    /** 计划状态。 */
    private String planStatus;

    /** 生产订单号。 */
    private String productionOrderNo;
}
