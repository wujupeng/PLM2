package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 上架任务保存请求（对应上架任务）。
 */
@Data
public class WmsPutawayTaskSaveRequest {

    /** 上架任务号（为空时自动生成）。 */
    private String taskNo;

    /** 收货单号。 */
    private String receiptNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 上架数量。 */
    private BigDecimal qty;

    /** 源库位（通常为待检区）。 */
    private String fromBinCode;

    /** 目标库位。 */
    private String toBinCode;

    /** 作业策略编码。 */
    private String strategyCode;

    /** 作业人。 */
    private String operator;

    /** 上架时间。 */
    private LocalDateTime putawayTime;

    /** 优先级，默认 0。 */
    private Integer taskPriority;

    /** 上架状态，为空默认 PENDING。 */
    private String putawayStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
