package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购入库单分页查询条件（G3-N3a ERP 采购管理）。
 * keyword 匹配 inboundNo/supplierCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseInboundQuery extends PageQuery {

    /** 入库状态。 */
    private String inboundStatus;

    /** 到货单号。 */
    private String receiptNo;

    /** 采购订单编号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;
}
