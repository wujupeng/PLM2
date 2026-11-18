package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 净需求保存请求（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 */
@Data
public class ErpNetRequirementSaveRequest {

    /** 净需求单号（为空时自动生成）。 */
    private String requirementNo;

    /** 关联运算单号。 */
    private String runNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 毛需求，为空默认 0。 */
    private BigDecimal grossQty;

    /** 现有库存，为空默认 0。 */
    private BigDecimal onHandQty;

    /** 在途数量，为空默认 0。 */
    private BigDecimal inTransitQty;

    /** 已分配数量，为空默认 0。 */
    private BigDecimal allocatedQty;

    /** 安全库存，为空默认 0。 */
    private BigDecimal safetyStock;

    /** 净需求，为空默认 0。 */
    private BigDecimal netQty;

    /** 损耗率，为空默认 0。 */
    private BigDecimal lossRate;

    /** 提前期(天)，为空默认 0。 */
    private Integer leadTimeDays;

    /** 需求日期。 */
    private LocalDateTime requiredDate;

    /** 净需求状态，为空默认 OPEN。 */
    private String requirementStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
