package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 退补料差异处理单保存请求。
 */
@Data
public class WmsMaterialDiffSaveRequest {

    /** 差异处理单号（为空时自动生成）。 */
    private String diffNo;

    /** 差异类型，为空默认 QTY（QTY 数量差异 / QUALITY 质量差异）。 */
    private String diffType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 实际数量。 */
    private BigDecimal actualQty;

    /** 差异数量。 */
    private BigDecimal diffQty;

    /** 差异原因。 */
    private String diffReason;

    /** 差异状态，为空默认 PENDING。 */
    private String diffStatus;

    /** 处理人。 */
    private String handler;

    /** 处理时间。 */
    private LocalDateTime handleTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
