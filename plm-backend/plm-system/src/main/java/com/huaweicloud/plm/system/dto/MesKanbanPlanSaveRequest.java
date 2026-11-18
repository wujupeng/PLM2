package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 计划达成记录保存请求。
 */
@Data
public class MesKanbanPlanSaveRequest {

    /** 计划达成单号（为空时自动生成）。 */
    private String planNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 完工数量。 */
    private BigDecimal finishQty;

    /** 达成率。 */
    private BigDecimal achieveRate;

    /** 计划日期。 */
    private LocalDateTime planDate;

    /** 产线编码。 */
    private String lineCode;

    /** 班次编码。 */
    private String shiftCode;

    /** 记录状态，为空默认 DRAFT。 */
    private String recordStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
