package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外发票分页查询条件（对应 WBS T094 委外加工闭环，属 G3 ERP）。
 * keyword 匹配 invoiceNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceInvoiceQuery extends PageQuery {

    /** 发票状态。 */
    private String invoiceStatus;

    /** 发票类型。 */
    private String invoiceType;

    /** 委外订单号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;
}
