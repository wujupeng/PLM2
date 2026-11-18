package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 需求计划—生产建议（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 依据净需求生成建议生产数量，支撑生产计划编制与下达。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_production_suggestion")
public class ErpProductionSuggestion extends BaseEntity {

    /** 生产建议单号（唯一，支持人工指定，为空时自动生成）。 */
    private String suggestionNo;

    /** 关联运算单号。 */
    private String runNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 单位，默认 PCS。 */
    private String uom;

    /** 净需求，默认 0。 */
    private BigDecimal netQty;

    /** 建议生产数量，默认 0。 */
    private BigDecimal suggestQty;

    /** BOM 版本。 */
    private String bomVersion;

    /** 仓库编码。 */
    private String warehouseCode;

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
