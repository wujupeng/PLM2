package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外到货单分页查询条件（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 * keyword 匹配 receiptNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceReceiptQuery extends PageQuery {

    /** 到货单状态。 */
    private String receiptStatus;

    /** 到货类型。 */
    private String receiptType;

    /** 关联委外订单号。 */
    private String orderNo;

    /** 加工商编码。 */
    private String supplierCode;
}
