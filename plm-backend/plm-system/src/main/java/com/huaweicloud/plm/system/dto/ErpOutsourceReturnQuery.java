package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外退货单分页查询条件（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）。
 * keyword 匹配 returnNo/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceReturnQuery extends PageQuery {

    /** 退货单状态。 */
    private String returnStatus;

    /** 委外订单号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;
}
