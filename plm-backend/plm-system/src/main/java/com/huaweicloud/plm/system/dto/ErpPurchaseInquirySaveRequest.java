package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 采购询价单保存请求（对应 WBS T023 采购管理，属 G3 ERP）。
 */
@Data
public class ErpPurchaseInquirySaveRequest {

    /** 询价单号（为空时自动生成）。 */
    private String inquiryNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 询价数量，为空默认 0。 */
    private BigDecimal inquiryQty;

    /** 询价日期。 */
    private LocalDateTime inquiryDate;

    /** 报价截止时间。 */
    private LocalDateTime quoteDeadline;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 报价单价，为空默认 0。 */
    private BigDecimal quotePrice;

    /** 币别，为空默认 CNY。 */
    private String currencyCode;

    /** 报价日期。 */
    private LocalDateTime quoteDate;

    /** 报价有效期。 */
    private LocalDateTime validUntil;

    /** 询价单状态，为空默认 DRAFT。 */
    private String inquiryStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
