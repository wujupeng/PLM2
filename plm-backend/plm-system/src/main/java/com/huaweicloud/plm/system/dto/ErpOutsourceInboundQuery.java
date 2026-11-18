package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外入库单分页查询条件（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 * keyword 匹配 inboundNo/receiptNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceInboundQuery extends PageQuery {

    /** 入库单状态。 */
    private String inboundStatus;

    /** 到货单号。 */
    private String receiptNo;

    /** 委外订单号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;
}
