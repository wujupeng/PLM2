package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购订单分页查询条件（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）。
 * keyword 匹配 orderNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseOrderQuery extends PageQuery {

    /** 订单状态。 */
    private String orderStatus;

    /** 审核状态。 */
    private String reviewStatus;

    /** 订单类型。 */
    private String orderType;

    /** 供应商编码。 */
    private String supplierCode;
}
