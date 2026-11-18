package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 供应商报价保存请求（对应供应商报价）。
 */
@Data
public class SrmSupplierQuoteSaveRequest {

    /** 报价单号（为空时自动生成）。 */
    private String quoteNo;

    /** 询价单号。 */
    private String rfqNo;

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

    /** 报价数量。 */
    private BigDecimal quoteQty;

    /** 单位。 */
    private String unit;

    /** 单价。 */
    private BigDecimal unitPrice;

    /** 税率%。 */
    private BigDecimal taxRate;

    /** 报价总额。 */
    private BigDecimal totalAmount;

    /** 币种，为空默认 CNY。 */
    private String currency;

    /** 交货天数。 */
    private Integer deliveryDays;

    /** 付款条件。 */
    private String paymentTerm;

    /** 报价日期。 */
    private LocalDate quoteDate;

    /** 报价有效期。 */
    private LocalDate validUntil;

    /** 报价状态，为空默认 DRAFT。 */
    private String quoteStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
