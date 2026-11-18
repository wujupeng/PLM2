package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 收付款单保存请求（对应 WBS T028 ERP 财务，属 G3 ERP）。
 */
@Data
public class ErpFinancePaymentSaveRequest {

    /** 收付款单号（为空时自动生成）。 */
    private String paymentNo;

    /** 收付款类型，为空默认 RECEIPT。 */
    private String paymentType;

    /** 往来单位类型，为空默认 CUSTOMER。 */
    private String partyType;

    /** 往来单位编码。 */
    @NotBlank(message = "往来单位编码不能为空")
    private String partyCode;

    /** 往来单位名称。 */
    private String partyName;

    /** 银行账号。 */
    private String bankAccount;

    /** 开户银行。 */
    private String bankName;

    /** 结算方式，为空默认 TRANSFER。 */
    private String paymentMethod;

    /** 金额，为空默认 0。 */
    private BigDecimal amount;

    /** 币种，为空默认 CNY。 */
    private String currencyCode;

    /** 收付款日期。 */
    private LocalDate paymentDate;

    /** 来源单据号。 */
    private String sourceNo;

    /** 收付款状态，为空默认 DRAFT。 */
    private String paymentStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
