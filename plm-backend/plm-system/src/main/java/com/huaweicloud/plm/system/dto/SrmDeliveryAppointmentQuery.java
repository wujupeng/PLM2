package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 送货预约分页查询条件（对应送货预约）。
 * keyword 匹配 appointmentNo/poNo/supplierCode/supplierName/vehicleNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmDeliveryAppointmentQuery extends PageQuery {

    /** 预约状态。 */
    private String appointmentStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 采购订单号。 */
    private String poNo;
}
