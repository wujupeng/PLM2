package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 委外发票保存请求（对应 WBS T094 委外加工闭环，属 G3 ERP）。
 */
@Data
public class ErpOutsourceInvoiceSaveRequest {

    /** 发票号（为空时自动生成）。 */
    private String invoiceNo;

    /** 发票类型，为空默认 SPECIAL。 */
    private String invoiceType;

    /** 发票代码。 */
    private String invoiceCode;

    /** 委外订单号。 */
    private String orderNo;

    /** 到货单号。 */
    private String receiptNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 开票日期。 */
    private LocalDateTime invoiceDate;

    /** 发票金额，为空默认 0。 */
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
