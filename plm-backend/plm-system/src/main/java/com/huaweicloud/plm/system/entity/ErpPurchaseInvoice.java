package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—采购发票（G3-N3a ERP 采购管理）：
 * 记录采购发票的类型、代码、关联采购订单/到货单、供应商、开票金额与税额等信息，
 * 供采购、财务进行发票登记与核算。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_invoice")
public class ErpPurchaseInvoice extends BaseEntity {

    /** 发票单编号（唯一，支持人工指定，为空时自动生成）。 */
    private String invoiceNo;

    /** 发票类型，默认 SPECIAL（专用发票）。 */
    private String invoiceType;

    /** 发票代码。 */
    private String invoiceCode;

    /** 关联采购订单编号。 */
    private String orderNo;

    /** 关联到货单编号。 */
    private String receiptNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

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
