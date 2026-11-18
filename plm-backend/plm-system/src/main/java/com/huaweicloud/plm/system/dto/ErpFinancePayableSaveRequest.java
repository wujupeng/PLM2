package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 应付单保存请求（对应 WBS T028 ERP 财务，属 G3 ERP）。
 */
@Data
public class ErpFinancePayableSaveRequest {

    /** 应付单号（为空时自动生成）。 */
    private String apNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 发票号。 */
    private String invoiceNo;

    /** 来源单号。 */
    private String sourceNo;

    /** 应付金额，为空默认 0。 */
    private BigDecimal apAmount;

    /** 已结算金额，为空默认 0。 */
    private BigDecimal settledAmount;

    /** 应付余额，为空默认 0。 */
    private BigDecimal apBalance;

    /** 币种，为空默认 CNY。 */
    private String currencyCode;

    /** 应付日期。 */
    private LocalDate apDate;

    /** 到期日期。 */
    private LocalDate dueDate;

    /** 应付状态，为空默认 OPEN。 */
    private String apStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
