package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 发运单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_shipment_order")
public class WmsShipmentOrder extends BaseEntity {

    /** 发运单号。 */
    private String shipmentNo;

    /** 发运类型，默认 SALES。 */
    private String shipmentType;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 已发运数量。 */
    private BigDecimal shippedQty;

    /** 承运商。 */
    private String carrier;

    /** 车牌号。 */
    private String vehicleNo;

    /** 司机姓名。 */
    private String driverName;

    /** 司机电话。 */
    private String driverPhone;

    /** 收货地址。 */
    private String deliveryAddress;

    /** 发运状态，默认 DRAFT。 */
    private String shipmentStatus;

    /** 装车人。 */
    private String loadBy;

    /** 装车时间。 */
    private LocalDateTime loadTime;

    /** 发运人。 */
    private String shipBy;

    /** 发运时间。 */
    private LocalDateTime shipTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
