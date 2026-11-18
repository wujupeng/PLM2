package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产补料单保存请求。
 */
@Data
public class WmsReplenishOrderSaveRequest {

    /** 补料单号。 */
    private String replenishNo;

    /** 补料类型，默认 REPLENISH（REPLENISH 生产补料 / OVER_ISSUE 超领）。 */
    private String replenishType;

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

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 补料数量。 */
    private BigDecimal replenishQty;

    /** 已发数量。 */
    private BigDecimal issuedQty;

    /** 补料原因。 */
    private String replenishReason;

    /** 补料状态，默认 DRAFT。 */
    private String replenishStatus;

    /** 申请人。 */
    private String applyBy;

    /** 申请时间。 */
    private LocalDateTime applyTime;

    /** 发放人。 */
    private String issueBy;

    /** 发放时间。 */
    private LocalDateTime issueTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
