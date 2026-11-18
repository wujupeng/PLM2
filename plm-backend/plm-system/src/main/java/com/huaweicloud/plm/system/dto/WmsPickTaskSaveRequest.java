package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 拣料单保存请求。
 */
@Data
public class WmsPickTaskSaveRequest {

    /** 拣料单号（为空时自动生成）。 */
    private String pickNo;

    /** 拣料类型，为空默认 PRODUCTION。 */
    private String pickType;

    /** 生产工单号。 */
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

    /** 源库位。 */
    private String fromBinCode;

    /** 目标库位。 */
    private String toBinCode;

    /** 需求数量。 */
    private BigDecimal requiredQty;

    /** 已拣数量。 */
    private BigDecimal pickedQty;

    /** 拣选策略，为空默认 FIFO。 */
    private String pickStrategy;

    /** 任务优先级。 */
    private Integer taskPriority;

    /** 作业人。 */
    private String operator;

    /** 拣料时间。 */
    private LocalDateTime pickTime;

    /** 拣料状态，为空默认 PENDING。 */
    private String pickStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
