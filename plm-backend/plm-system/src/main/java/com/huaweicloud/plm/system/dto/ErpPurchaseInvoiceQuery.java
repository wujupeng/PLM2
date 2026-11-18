package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购发票分页查询条件（G3-N3a ERP 采购管理）。
 * keyword 匹配 invoiceNo/orderNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseInvoiceQuery extends PageQuery {

    /** 发票状态。 */
    private String invoiceStatus;

    /** 发票类型。 */
    private String invoiceType;

    /** 关联采购订单编号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;
}
