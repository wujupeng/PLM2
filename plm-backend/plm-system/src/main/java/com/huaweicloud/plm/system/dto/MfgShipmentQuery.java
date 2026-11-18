package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 出货单分页查询条件（N8，DEV-090/091/092）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgShipmentQuery extends PageQuery {

    /** 出货单号。 */
    private String shipmentNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户订单号。 */
    private String orderNo;

    /** 产品编码。 */
    private String productCode;

    /** 生产批次号。 */
    private String batchNo;

    /** 出货状态：CREATED/VERIFIED/RELEASED/SHIPPED/CANCELLED。 */
    private String shipmentStatus;

    /** 放行状态：UNRELEASED/RELEASED/HOLD。 */
    private String releaseStatus;
}
