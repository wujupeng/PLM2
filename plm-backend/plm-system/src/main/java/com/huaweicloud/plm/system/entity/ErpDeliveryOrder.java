package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 销售管理—发货单头（G3-N2 ERP 销售管理）：
 * 记录销售发货单据的客户、仓库、承运与状态等信息，与发货行构成主子表。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_delivery_order")
public class ErpDeliveryOrder extends BaseEntity {

    /** 发货单号（唯一，支持人工指定，为空时自动生成）。 */
    private String deliveryNo;

    /** 发货类型，默认 NORMAL。 */
    private String deliveryType;

    /** 来源销售订单号。 */
    private String orderNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 发货日期。 */
    private LocalDateTime deliveryDate;

    /** 发货仓库编码。 */
    private String warehouseCode;

    /** 收货地址。 */
    private String receiverAddress;

    /** 联系人。 */
    private String contact;

    /** 联系电话。 */
    private String phone;

    /** 承运商。 */
    private String carrier;

    /** 物流单号。 */
    private String trackingNo;

    /** 发货状态，默认 DRAFT。 */
    private String deliveryStatus;

    /** 发货总数量，默认 0。 */
    private BigDecimal totalQty;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
