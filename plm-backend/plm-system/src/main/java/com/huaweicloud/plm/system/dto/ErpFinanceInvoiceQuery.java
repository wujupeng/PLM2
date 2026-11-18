package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 发票登记分页查询条件（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 * keyword 匹配 invoiceNo/invoiceCode/partyName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinanceInvoiceQuery extends PageQuery {

    /** 发票类型。 */
    private String invoiceType;

    /** 收发方向。 */
    private String direction;

    /** 发票状态。 */
    private String invoiceStatus;

    /** 查验状态。 */
    private String verifyStatus;
}
