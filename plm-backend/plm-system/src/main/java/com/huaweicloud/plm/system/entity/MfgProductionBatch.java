package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 生产批次档案（N8，DEV-085）：关联工单、产品、BOM/工艺版本、生产日期、班次、产线与人员。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_production_batch")
public class MfgProductionBatch extends BaseEntity {

    /** 生产批次号（唯一）。 */
    private String batchNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 产品版本。 */
    private String productVersion;

    /** 生效 BOM 版本。 */
    private String bomVersion;

    /** 生效工艺版本。 */
    private String processVersion;

    /** 生产日期。 */
    private LocalDate productionDate;

    /** 班次：DAY/NIGHT/...。 */
    private String shiftCode;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 计划数量。 */
    private BigDecimal plannedQty;

    /** 完工数量。 */
    private BigDecimal completedQty;

    /** 报废数量。 */
    private BigDecimal scrapQty;

    /** 批次状态：PLANNED/IN_PROCESS/COMPLETED/CLOSED。 */
    private String batchStatus;

    /** 放行状态：UNRELEASED/RELEASED/HOLD。 */
    private String releaseStatus;

    /** 来源系统。 */
    private String sourceSystem;

    private String remark;
}
