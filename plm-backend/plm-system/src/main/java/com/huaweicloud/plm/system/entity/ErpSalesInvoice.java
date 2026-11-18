package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 销售管理—销售发票（G3-N2 ERP 销售管理）：
 * 记录销售发票的类型、代码、关联订单/发货单、客户、开票金额与税额等信息，
 * 供销售、财务进行开票与核算。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_sales_invoice")
public class ErpSalesInvoice extends BaseEntity {

    /** 发票单编号（唯一，支持人工指定，为空时自动生成）。 */
    private String invoiceNo;

    /** 发票类型，默认 SPECIAL（专用发票）。 */
    private String invoiceType;

    /** 发票代码。 */
    private String invoiceCode;

    /** 关联销售订单编号。 */
    private String orderNo;

    /** 关联发货单编号。 */
    private String deliveryNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 开票日期。 */
    private LocalDateTime invoiceDate;

    /** 开票金额，默认 0。 */
    private BigDecimal invoiceAmount;

    /** 税率，默认 0。 */
    private BigDecimal taxRate;

    /** 税额，默认 0。 */
    private BigDecimal taxAmount;

    /** 不含税金额，默认 0。 */
    private BigDecimal netAmount;

    /** 发票状态，默认 DRAFT。 */
    private String invoiceStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
