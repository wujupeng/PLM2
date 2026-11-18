package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 寻源与询报价—供应商报价（对应供应商报价）：
 * 登记报价单号、询价单号、供应商与物料信息、数量单价税率与报价总额、交货与付款条件，
 * 支撑寻源询报价的价格追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier_quote")
public class SrmSupplierQuote extends BaseEntity {

    /** 报价单号（唯一，为空时自动生成）。 */
    private String quoteNo;

    /** 询价单号。 */
    private String rfqNo;

    /** 供应商编码。 */
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

    /** 币种，默认 CNY。 */
    private String currency;

    /** 交货天数。 */
    private Integer deliveryDays;

    /** 付款条件。 */
    private String paymentTerm;

    /** 报价日期。 */
    private LocalDate quoteDate;

    /** 报价有效期。 */
    private LocalDate validUntil;

    /** 报价状态，默认 DRAFT。 */
    private String quoteStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
