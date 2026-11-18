package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外结算单分页查询条件（对应 WBS T024 委外管理，属 G3 ERP）。
 * keyword 匹配 settlementNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceSettlementQuery extends PageQuery {

    /** 结算单状态。 */
    private String settlementStatus;

    /** 委外订单号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 发票号。 */
    private String invoiceNo;
}
