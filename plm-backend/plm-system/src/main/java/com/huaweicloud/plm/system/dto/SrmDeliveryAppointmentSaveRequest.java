package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 送货预约保存请求（对应送货预约）。
 */
@Data
public class SrmDeliveryAppointmentSaveRequest {

    /** 送货预约编号（为空时自动生成）。 */
    private String appointmentNo;

    /** 采购订单号。 */
    @NotBlank(message = "采购订单号不能为空")
    private String poNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 预约数量。 */
    private BigDecimal appointQty;

    /** 单位。 */
    private String unit;

    /** 送货日期。 */
    private LocalDate deliveryDate;

    /** 送货时段。 */
    private String timeSlot;

    /** 收货仓库编码。 */
    private String warehouseCode;

    /** 收货仓库名称。 */
    private String warehouseName;

    /** 车辆车牌号。 */
    private String vehicleNo;

    /** 司机姓名。 */
    private String driver;

    /** 司机电话。 */
    private String driverPhone;

    /** 预约人。 */
    private String appointBy;

    /** 预约日期。 */
    private LocalDate appointDate;

    /** 预约状态，为空默认 PENDING。 */
    private String appointmentStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
