package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 核销单保存请求（对应 WBS T028 ERP 财务，属 G3 ERP）。
 */
@Data
public class ErpFinanceWriteoffSaveRequest {

    /** 核销单号（为空时自动生成）。 */
    private String writeoffNo;

    /** 核销类型，为空默认 AR。 */
    private String writeoffType;

    /** 往来单位编码。 */
    @NotBlank(message = "往来单位编码不能为空")
    private String partyCode;

    /** 往来单位名称。 */
    private String partyName;

    /** 来源单据号。 */
    private String sourceNo;

    /** 目标单据号。 */
    private String targetNo;

    /** 核销金额，为空默认 0。 */
    private BigDecimal writeoffAmount;

    /** 币种，为空默认 CNY。 */
    private String currencyCode;

    /** 核销日期。 */
    private LocalDate writeoffDate;

    /** 核销状态，为空默认 DRAFT。 */
    private String writeoffStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
