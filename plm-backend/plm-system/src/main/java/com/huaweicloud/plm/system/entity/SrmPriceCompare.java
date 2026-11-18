package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 寻源与询报价—报价比价（对应报价比价）：
 * 登记比价单号、关联询价单、参与供应商数与报价区间、推荐供应商、比价规则与结论，支撑询报价比价追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_price_compare")
public class SrmPriceCompare extends BaseEntity {

    /** 比价单号（唯一，为空时自动生成）。 */
    private String compareNo;

    /** 询价单号。 */
    private String rfqNo;

    /** 比价标题。 */
    private String compareTitle;

    /** 参与供应商数。 */
    private Integer supplierCount;

    /** 最低报价。 */
    private BigDecimal lowestPrice;

    /** 最高报价。 */
    private BigDecimal highestPrice;

    /** 平均报价。 */
    private BigDecimal avgPrice;

    /** 推荐供应商编码。 */
    private String recommendSupplierCode;

    /** 推荐供应商名称。 */
    private String recommendSupplierName;

    /** 比价规则，默认 LOWEST_PRICE。 */
    private String compareRule;

    /** 比价结论。 */
    private String compareConclusion;

    /** 比价人。 */
    private String compareBy;

    /** 比价日期。 */
    private LocalDate compareDate;

    /** 比价状态，默认 DRAFT。 */
    private String compareStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
