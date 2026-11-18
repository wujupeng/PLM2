package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外发票（对应 WBS T094 委外加工闭环，属 G3 ERP）：
 * 记录委外加工供应商开具的发票类型、发票金额、税率与税额/不含税金额，
 * 作为委外结算与付款对账的依据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_invoice")
public class ErpOutsourceInvoice extends BaseEntity {

    /** 发票号（唯一，支持人工指定，为空时自动生成）。 */
    private String invoiceNo;

    /** 发票类型，默认 SPECIAL。 */
    private String invoiceType;

    /** 发票代码。 */
    private String invoiceCode;

    /** 委外订单号。 */
    private String orderNo;

    /** 到货单号。 */
    private String receiptNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 开票日期。 */
    private LocalDateTime invoiceDate;

    /** 发票金额，默认 0。 */
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
