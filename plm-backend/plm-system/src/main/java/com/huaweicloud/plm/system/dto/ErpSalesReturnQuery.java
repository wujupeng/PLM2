package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 销售退货分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 returnNo/orderNo/customerName/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpSalesReturnQuery extends PageQuery {

    /** 退货单状态。 */
    private String returnStatus;

    /** 关联销售订单编号。 */
    private String orderNo;

    /** 客户编码。 */
    private String customerCode;
}
