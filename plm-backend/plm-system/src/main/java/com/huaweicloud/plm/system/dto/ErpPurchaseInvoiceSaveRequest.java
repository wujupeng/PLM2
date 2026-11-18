package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 采购发票保存请求（G3-N3a ERP 采购管理）。
 */
@Data
public class ErpPurchaseInvoiceSaveRequest {

    /** 发票单编号（为空时自动生成）。 */
    private String invoiceNo;

    /** 发票类型，为空默认 SPECIAL。 */
    private String invoiceType;

    /** 发票代码。 */
    private String invoiceCode;

    /** 关联采购订单编号。 */
    private String orderNo;

    /** 关联到货单编号。 */
    private String receiptNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 开票日期。 */
    private LocalDateTime invoiceDate;

    /** 开票金额，为空默认 0。 */
    private BigDecimal invoiceAmount;

    /** 税率，为空默认 0。 */
    private BigDecimal taxRate;

    /** 税额，为空默认 0。 */
    private BigDecimal taxAmount;

    /** 不含税金额，为空默认 0。 */
    private BigDecimal netAmount;

    /** 发票状态，为空默认 DRAFT。 */
    private String invoiceStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
