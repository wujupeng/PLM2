package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 销售管理—销售订单头（G3-N2 ERP 销售管理）：
 * 记录销售订单的客户、区域、业务员、项目、币别、结算与金额等主信息，
 * 明细行见 {@link ErpSalesOrderLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_sales_order")
public class ErpSalesOrder extends BaseEntity {

    /** 订单编号（唯一，支持人工指定，为空时自动生成）。 */
    private String orderNo;

    /** 订单类型，默认 STANDARD。 */
    private String orderType;

    /** 客户编码。 */
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

    /** 信用状态，默认 OK。 */
    private String creditStatus;

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

    /** 已发货金额，默认 0。 */
    private BigDecimal deliveredAmount;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
