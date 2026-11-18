package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 委外订单头保存请求（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 */
@Data
public class ErpOutsourceOrderSaveRequest {

    /** 委外订单号（为空时自动生成）。 */
    private String orderNo;

    /** 订单类型，为空默认 STANDARD。 */
    private String orderType;

    /** 加工商编码。 */
    @NotBlank(message = "加工商编码不能为空")
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

    /** 含税总金额，为空默认 0。 */
    private BigDecimal totalAmount;

    /** 税额，为空默认 0。 */
    private BigDecimal taxAmount;

    /** 不含税金额，为空默认 0。 */
    private BigDecimal netAmount;

    /** 已收货金额，为空默认 0。 */
    private BigDecimal receivedAmount;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
