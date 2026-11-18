package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 发运单分页查询条件。
 * keyword 匹配 shipmentNo/customerName/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsShipmentOrderQuery extends PageQuery {

    /** 发运状态。 */
    private String shipmentStatus;

    /** 发运类型。 */
    private String shipmentType;

    /** 客户编码。 */
    private String customerCode;

    /** 物料编码。 */
    private String materialCode;
}
