package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 发货单分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 deliveryNo/orderNo/customerName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpDeliveryOrderQuery extends PageQuery {

    /** 发货状态。 */
    private String deliveryStatus;

    /** 发货类型。 */
    private String deliveryType;

    /** 来源销售订单号。 */
    private String orderNo;

    /** 客户编码。 */
    private String customerCode;
}
