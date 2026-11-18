package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 需求计划—计划调整（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 登记需求计划数量/日期的调整前后值，支撑计划变更留痕与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_plan_adjustment")
public class ErpPlanAdjustment extends BaseEntity {

    /** 计划调整单号（唯一，支持人工指定，为空时自动生成）。 */
    private String adjustmentNo;

    /** 关联需求计划号。 */
    private String planNo;

    /** 调整类型，默认 DEMAND。 */
    private String adjustmentType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 单位，默认 PCS。 */
    private String uom;

    /** 原数量，默认 0。 */
    private BigDecimal oldQty;

    /** 新数量，默认 0。 */
    private BigDecimal newQty;

    /** 原日期。 */
    private LocalDateTime oldDate;

    /** 新日期。 */
    private LocalDateTime newDate;

    /** 调整原因。 */
    private String adjustReason;

    /** 调整人。 */
    private String adjustBy;

    /** 调整日期。 */
    private LocalDateTime adjustDate;

    /** 调整状态，默认 DRAFT。 */
    private String adjustmentStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
