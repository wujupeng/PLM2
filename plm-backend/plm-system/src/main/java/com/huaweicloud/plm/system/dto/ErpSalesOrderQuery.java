package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 销售订单分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 orderNo/customerName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpSalesOrderQuery extends PageQuery {

    /** 订单状态。 */
    private String orderStatus;

    /** 审核状态。 */
    private String reviewStatus;

    /** 订单类型。 */
    private String orderType;

    /** 客户编码。 */
    private String customerCode;
}
