package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 销售出库分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 outboundNo/orderNo/deliveryNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpSalesOutboundQuery extends PageQuery {

    /** 出库状态。 */
    private String outboundStatus;

    /** 来源销售订单号。 */
    private String orderNo;

    /** 关联发货单号。 */
    private String deliveryNo;

    /** 客户编码。 */
    private String customerCode;
}
