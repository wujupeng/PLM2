package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 需求计划—需求计划单行（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 记录需求计划行的物料、需求数量、需求来源与需求日期等信息，隶属需求计划单头 {@link ErpDemandPlan}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_demand_plan_line")
public class ErpDemandPlanLine extends BaseEntity {

    /** 所属需求计划头 ID。 */
    private Long planId;

    /** 所属需求计划号（冗余，便于查询展示）。 */
    private String planNo;

    /** 行号。 */
    private Integer lineNo;

    /** 行状态，默认 OPEN。 */
    private String lineStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 需求数量，默认 0。 */
    private BigDecimal demandQty;

    /** 需求来源类型，默认 SALES。 */
    private String sourceType;

    /** 来源单号。 */
    private String sourceNo;

    /** 客户编码。 */
    private String customerCode;

    /** 需求日期。 */
    private LocalDateTime demandDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
