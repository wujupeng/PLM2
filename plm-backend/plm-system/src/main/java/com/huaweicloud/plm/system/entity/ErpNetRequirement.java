package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 需求计划—净需求（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 依据毛需求、库存、在途、已分配与安全库存计算物料净需求，支撑后续采购与生产建议。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_net_requirement")
public class ErpNetRequirement extends BaseEntity {

    /** 净需求单号（唯一，支持人工指定，为空时自动生成）。 */
    private String requirementNo;

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

    /** 毛需求，默认 0。 */
    private BigDecimal grossQty;

    /** 现有库存，默认 0。 */
    private BigDecimal onHandQty;

    /** 在途数量，默认 0。 */
    private BigDecimal inTransitQty;

    /** 已分配数量，默认 0。 */
    private BigDecimal allocatedQty;

    /** 安全库存，默认 0。 */
    private BigDecimal safetyStock;

    /** 净需求，默认 0。 */
    private BigDecimal netQty;

    /** 损耗率，默认 0。 */
    private BigDecimal lossRate;

    /** 提前期(天)，默认 0。 */
    private Integer leadTimeDays;

    /** 需求日期。 */
    private LocalDateTime requiredDate;

    /** 净需求状态，默认 OPEN。 */
    private String requirementStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
