package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—采购订单头（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）：
 * 记录采购订单的供应商、采购员、采购组、币别、结算与金额等主信息，
 * 明细行见 {@link ErpPurchaseOrderLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_order")
public class ErpPurchaseOrder extends BaseEntity {

    /** 订单编号（唯一，支持人工指定，为空时自动生成）。 */
    private String orderNo;

    /** 订单类型，默认 STANDARD。 */
    private String orderType;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 采购员。 */
    private String buyerName;

    /** 采购组。 */
    private String purchaseGroup;

    /** 订单日期。 */
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

    /** 订单总金额（含税），默认 0。 */
    private BigDecimal totalAmount;

    /** 税额，默认 0。 */
    private BigDecimal taxAmount;

    /** 净额（不含税），默认 0。 */
    private BigDecimal netAmount;

    /** 已到货金额，默认 0。 */
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
