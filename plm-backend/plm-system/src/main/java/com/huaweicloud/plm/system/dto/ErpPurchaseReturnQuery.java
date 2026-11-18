package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购退货分页查询条件（G3-N3a ERP 采购管理）。
 * keyword 匹配 returnNo/orderNo/supplierName/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseReturnQuery extends PageQuery {

    /** 退货单状态。 */
    private String returnStatus;

    /** 关联采购订单编号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;
}
