package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 出货单（N8，DEV-090/091/092）：客户订单匹配、扫码复核、发货放行与 ASN 关联。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_shipment")
public class MfgShipment extends BaseEntity {

    /** 出货单号（唯一）。 */
    private String shipmentNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 客户订单号。 */
    private String orderNo;

    /** 交付计划号。 */
    private String deliveryPlanNo;

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 产品版本。 */
    private String productVersion;

    /** 订单数量。 */
    private BigDecimal orderQty;

    /** 计划发货数量。 */
    private BigDecimal plannedQty;

    /** 已扫码数量。 */
    private BigDecimal scannedQty;

    /** 已发运数量。 */
    private BigDecimal shippedQty;

    /** 包装数量。 */
    private Integer packageCount;

    /** 出货状态：CREATED/VERIFIED/RELEASED/SHIPPED/CANCELLED。 */
    private String shipmentStatus;

    /** 放行状态：UNRELEASED/RELEASED/HOLD。 */
    private String releaseStatus;

    /** 承运商。 */
    private String carrier;

    /** 车牌号。 */
    private String vehicleNo;

    /** 司机。 */
    private String driver;

    /** 司机电话。 */
    private String driverPhone;

    /** 发货日期。 */
    private LocalDate shipDate;

    /** ASN 单号（放行后生成）。 */
    private String asnNo;

    /** ASN 状态。 */
    private String asnStatus;

    /** 放行人。 */
    private String releaseBy;

    /** 放行时间。 */
    private LocalDateTime releaseAt;

    private String remark;
}
