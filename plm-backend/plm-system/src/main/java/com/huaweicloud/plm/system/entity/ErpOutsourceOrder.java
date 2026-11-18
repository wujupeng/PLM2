package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外订单头（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 记录委外订单的加工商、采购员、下单/需求日期、币别汇率与结算方式、金额与状态等主信息，
 * 明细行见 {@link ErpOutsourceOrderLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_order")
public class ErpOutsourceOrder extends BaseEntity {

    /** 委外订单号（唯一，支持人工指定，为空时自动生成）。 */
    private String orderNo;

    /** 订单类型，默认 STANDARD。 */
    private String orderType;

    /** 加工商编码。 */
    private String supplierCode;

    /** 加工商名称。 */
    private String supplierName;

    /** 采购员。 */
    private String buyerName;

    /** 采购组。 */
    private String purchaseGroup;

    /** 下单日期。 */
    private LocalDateTime orderDate;

    /** 需求日期。 */
    private LocalDateTime requiredDate;

    /** 币别，默认 CNY。 */
    private String currencyCode;

    /** 汇率，默认 1。 */
    private BigDecimal exchangeRate;

    /** 税码。 */
    private String taxCode;

    /** 付款条件，默认 NET30。 */
    private String paymentTerm;

    /** 结算方式，默认 TRANSFER。 */
    private String settleMethod;

    /** 审核状态，默认 PENDING。 */
    private String reviewStatus;

    /** 订单状态，默认 DRAFT。 */
    private String orderStatus;

    /** 含税总金额，默认 0。 */
    private BigDecimal totalAmount;

    /** 税额，默认 0。 */
    private BigDecimal taxAmount;

    /** 不含税金额，默认 0。 */
    private BigDecimal netAmount;

    /** 已收货金额，默认 0。 */
    private BigDecimal receivedAmount;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
