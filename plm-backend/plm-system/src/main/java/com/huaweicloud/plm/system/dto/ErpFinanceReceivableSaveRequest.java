package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 应收单保存请求（对应 WBS T028 ERP 财务，属 G3 ERP）。
 */
@Data
public class ErpFinanceReceivableSaveRequest {

    /** 应收单号（为空时自动生成）。 */
    private String arNo;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 发票号。 */
    private String invoiceNo;

    /** 来源单号。 */
    private String sourceNo;

    /** 应收金额，为空默认 0。 */
    private BigDecimal arAmount;

    /** 已结算金额，为空默认 0。 */
    private BigDecimal settledAmount;

    /** 应收余额，为空默认 0。 */
    private BigDecimal arBalance;

    /** 币种，为空默认 CNY。 */
    private String currencyCode;

    /** 应收日期。 */
    private LocalDate arDate;

    /** 到期日期。 */
    private LocalDate dueDate;

    /** 应收状态，为空默认 OPEN。 */
    private String arStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
