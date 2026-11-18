package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购结算分页查询条件（G3-N3a ERP 采购管理）。
 * keyword 匹配 settlementNo/orderNo/supplierName/invoiceNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseSettlementQuery extends PageQuery {

    /** 结算状态。 */
    private String settlementStatus;

    /** 关联采购订单编号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 关联采购发票编号。 */
    private String invoiceNo;
}
