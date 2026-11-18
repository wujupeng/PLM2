package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 采购协同—送货预约：登记送货预约编号、采购订单号与供应商物料、预约数量、
 * 送货日期与时段、收货仓库、车辆司机信息及预约状态，支撑供应商送货预约协同追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_delivery_appointment")
public class SrmDeliveryAppointment extends BaseEntity {

    /** 送货预约编号（为空时自动生成）。 */
    private String appointmentNo;

    /** 采购订单号。 */
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

    /** 预约状态，默认 PENDING。 */
    private String appointmentStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
