package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 定点定价协议保存请求（对应定点定价协议）。
 */
@Data
public class SrmPriceAgreementSaveRequest {

    /** 协议编号（为空时自动生成）。 */
    private String agreementNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 价格类型，为空默认 AGREEMENT。 */
    private String priceType;

    /** 单位。 */
    private String unit;

    /** 协议单价。 */
    private BigDecimal unitPrice;

    /** 币种，为空默认 CNY。 */
    private String currency;

    /** 税率%。 */
    private BigDecimal taxRate;

    /** 最小起订量。 */
    private BigDecimal moq;

    /** 交货周期天数。 */
    private Integer leadTimeDays;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 失效日期。 */
    private LocalDate expireDate;

    /** 协议状态，为空默认 DRAFT。 */
    private String agreementStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
