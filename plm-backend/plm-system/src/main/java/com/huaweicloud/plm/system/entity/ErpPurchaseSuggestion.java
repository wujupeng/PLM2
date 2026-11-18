package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 需求计划—采购建议（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 依据净需求生成建议采购数量、建议供应商与建议单价，支撑采购下单决策。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_suggestion")
public class ErpPurchaseSuggestion extends BaseEntity {

    /** 采购建议单号（唯一，支持人工指定，为空时自动生成）。 */
    private String suggestionNo;

    /** 关联运算单号。 */
    private String runNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 净需求，默认 0。 */
    private BigDecimal netQty;

    /** 建议采购数量，默认 0。 */
    private BigDecimal suggestQty;

    /** 建议供应商。 */
    private String suggestedSupplier;

    /** 建议单价，默认 0。 */
    private BigDecimal suggestedPrice;

    /** 币别，默认 CNY。 */
    private String currencyCode;

    /** 需求日期。 */
    private LocalDateTime requiredDate;

    /** 建议状态，默认 OPEN。 */
    private String suggestionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
