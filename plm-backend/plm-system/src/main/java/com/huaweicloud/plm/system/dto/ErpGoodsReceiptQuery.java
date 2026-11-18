package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购到货单分页查询条件（G3-N3a ERP 采购管理）。
 * keyword 匹配 receiptNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpGoodsReceiptQuery extends PageQuery {

    /** 到货单状态。 */
    private String receiptStatus;

    /** 到货类型。 */
    private String receiptType;

    /** 采购订单编号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;
}
