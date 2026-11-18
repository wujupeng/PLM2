package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 生产批次保存请求（N8，DEV-085）。
 */
@Data
public class MfgBatchSaveRequest {

    /** 生产批次号（可选，留空自动生成）。 */
    private String batchNo;

    /** 工单号。 */
    private String workOrderNo;

    @NotBlank(message = "产品编码不能为空")
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

    /** 班次。 */
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

    /** 批次状态。 */
    private String batchStatus;

    /** 放行状态。 */
    private String releaseStatus;

    /** 来源系统。 */
    private String sourceSystem;

    private String remark;
}
