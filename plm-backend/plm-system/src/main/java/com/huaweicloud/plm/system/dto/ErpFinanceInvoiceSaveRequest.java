package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 发票登记保存请求（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Data
public class ErpFinanceInvoiceSaveRequest {

    /** 发票号码（唯一，由用户提供）。 */
    @NotBlank(message = "发票号码不能为空")
    private String invoiceNo;

    /** 发票代码。 */
    private String invoiceCode;

    /** 发票类型，为空默认 VAT_SPECIAL。 */
    private String invoiceType;

    /** 收发方向（IN 进项 / OUT 销项），为空默认 OUT。 */
    private String direction;

    /** 往来单位类型，为空默认 CUSTOMER。 */
    private String partyType;

    /** 往来单位编码。 */
    private String partyCode;

    /** 往来单位名称。 */
    private String partyName;

    /** 来源单号。 */
    private String sourceNo;

    /** 不含税金额，为空默认 0。 */
    private BigDecimal amount;

    /** 税率，为空默认 0。 */
    private BigDecimal taxRate;

    /** 税额，为空默认 0。 */
    private BigDecimal taxAmount;

    /** 价税合计，为空默认 0。 */
    private BigDecimal totalAmount;

    /** 币种编码，为空默认 CNY。 */
    private String currencyCode;

    /** 开票日期。 */
    private LocalDate invoiceDate;

    /** 查验状态，为空默认 UNVERIFIED。 */
    private String verifyStatus;

    /** 发票状态，为空默认 DRAFT。 */
    private String invoiceStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
