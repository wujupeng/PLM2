package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 终检记录保存请求。
 */
@Data
public class MesFinalInspectionSaveRequest {

    /** 终检单号（为空时自动生成）。 */
    private String finalNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 检验数量。 */
    private BigDecimal inspectionQty;

    /** 抽样数量。 */
    private BigDecimal sampleQty;

    /** 合格数量。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量。 */
    private BigDecimal unqualifiedQty;

    /** 检验结果。 */
    private String inspectionResult;

    /** 检验状态，为空默认 PENDING。 */
    private String inspectionStatus;

    /** 检验员。 */
    private String inspector;

    /** 检验时间。 */
    private LocalDateTime inspectionTime;

    /** 判定单号。 */
    private String judgeNo;

    /** 客户编码。 */
    private String customerCode;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
