package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 计划调整保存请求（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 */
@Data
public class ErpPlanAdjustmentSaveRequest {

    /** 计划调整单号（为空时自动生成）。 */
    private String adjustmentNo;

    /** 关联需求计划号。 */
    private String planNo;

    /** 调整类型，为空默认 DEMAND。 */
    private String adjustmentType;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 单位，为空默认 PCS。 */
    private String uom;

    /** 原数量，为空默认 0。 */
    private BigDecimal oldQty;

    /** 新数量，为空默认 0。 */
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

    /** 调整状态，为空默认 DRAFT。 */
    private String adjustmentStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
