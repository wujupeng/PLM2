package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 采购订单头保存请求（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）。
 */
@Data
public class ErpPurchaseOrderSaveRequest {

    /** 订单编号（为空时自动生成）。 */
    private String orderNo;

    /** 订单类型，为空默认 STANDARD。 */
    private String orderType;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
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

    /** 币别，为空默认 CNY。 */
    private String currencyCode;

    /** 汇率，为空默认 1。 */
    private BigDecimal exchangeRate;

    /** 税码。 */
    private String taxCode;

    /** 付款条件，为空默认 NET30。 */
    private String paymentTerm;

    /** 结算方式，为空默认 TRANSFER。 */
    private String settleMethod;

    /** 审核状态，为空默认 PENDING。 */
    private String reviewStatus;

    /** 订单状态，为空默认 DRAFT。 */
    private String orderStatus;

    /** 订单总金额（含税），为空默认 0。 */
    private BigDecimal totalAmount;

    /** 税额，为空默认 0。 */
    private BigDecimal taxAmount;

    /** 净额（不含税），为空默认 0。 */
    private BigDecimal netAmount;

    /** 已到货金额，为空默认 0。 */
    private BigDecimal receivedAmount;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
