package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 暂估保存请求（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Data
public class ErpFinanceAccrualSaveRequest {

    /** 暂估单号（为空时自动生成）。 */
    private String accrualNo;

    /** 暂估类型，为空默认 AP。 */
    private String accrualType;

    /** 往来单位编码。 */
    @NotBlank(message = "往来单位编码不能为空")
    private String partyCode;

    /** 往来单位名称。 */
    private String partyName;

    /** 来源单号。 */
    private String sourceNo;

    /** 会计期间编码。 */
    private String periodCode;

    /** 暂估金额，为空默认 0。 */
    private BigDecimal amount;

    /** 税额，为空默认 0。 */
    private BigDecimal taxAmount;

    /** 币种，为空默认 CNY。 */
    private String currencyCode;

    /** 暂估日期。 */
    private LocalDate accrualDate;

    /** 是否已冲回，0=未冲回，为空默认 0。 */
    private Integer reversed;

    /** 暂估状态，为空默认 DRAFT。 */
    private String accrualStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
