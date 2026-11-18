package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 出货单保存请求（N8，DEV-090）。
 */
@Data
public class MfgShipmentSaveRequest {

    /** 出货单号（可选，留空自动生成）。 */
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

    /** 包装数量。 */
    private Integer packageCount;

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

    /** 出货明细。 */
    private List<MfgShipmentLineRequest> lines;

    private String remark;
}
