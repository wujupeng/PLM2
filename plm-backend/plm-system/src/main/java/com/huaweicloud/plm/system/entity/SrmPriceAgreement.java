package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 寻源与询报价—定点定价协议（对应定点定价协议）：
 * 登记协议编号、供应商、物料与规格、价格类型与单价、币种税率、起订量与交货周期、
 * 生效失效日期及协议状态，支撑定点定价协议追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_price_agreement")
public class SrmPriceAgreement extends BaseEntity {

    /** 协议编号（为空时自动生成）。 */
    private String agreementNo;

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

    /** 价格类型，默认 AGREEMENT。 */
    private String priceType;

    /** 单位。 */
    private String unit;

    /** 协议单价。 */
    private BigDecimal unitPrice;

    /** 币种，默认 CNY。 */
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

    /** 协议状态，默认 DRAFT。 */
    private String agreementStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
