package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 销售订单头保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpSalesOrderSaveRequest {

    /** 订单编号（为空时自动生成）。 */
    private String orderNo;

    /** 订单类型，为空默认 STANDARD。 */
    private String orderType;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 销售区域。 */
    private String salesRegion;

    /** 业务员。 */
    private String salesperson;

    /** 项目编码。 */
    private String projectCode;

    /** 订单日期。 */
    private LocalDateTime orderDate;

    /** 交货日期。 */
    private LocalDateTime deliveryDate;

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

    /** 信用状态，为空默认 OK。 */
    private String creditStatus;

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

    /** 已发货金额，为空默认 0。 */
    private BigDecimal deliveredAmount;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
