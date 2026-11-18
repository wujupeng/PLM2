package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工序报工分页查询条件（对应 G3-N7b ERP 工艺资源—工序报工）。
 * keyword 匹配 reportNo/planNo/productionOrderNo/materialCode/reporter。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProcessReportQuery extends PageQuery {

    /** 报工状态。 */
    private String reportStatus;

    /** 计划单号。 */
    private String planNo;

    /** 生产订单号。 */
    private String productionOrderNo;
}
