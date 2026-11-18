package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 销售发票分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 invoiceNo/orderNo/customerName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpSalesInvoiceQuery extends PageQuery {

    /** 发票状态。 */
    private String invoiceStatus;

    /** 发票类型。 */
    private String invoiceType;

    /** 关联销售订单编号。 */
    private String orderNo;

    /** 客户编码。 */
    private String customerCode;
}
