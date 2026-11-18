package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 派工任务保存请求。
 */
@Data
public class MesDispatchSaveRequest {

    /** 派工单号（为空时自动生成）。 */
    private String dispatchNo;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 工序编码。 */
    private String processCode;

    /** 工序名称。 */
    private String processName;

    /** 设备编码。 */
    private String equipmentCode;

    /** 产线编码。 */
    private String lineCode;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 派工数量。 */
    private BigDecimal dispatchedQty;

    /** 进度数量。 */
    private BigDecimal progressQty;

    /** 进度率。 */
    private BigDecimal progressRate;

    /** 派工状态，为空默认 DRAFT。 */
    private String dispatchStatus;

    /** 操作工。 */
    private String operator;

    /** 派工时间。 */
    private LocalDateTime dispatchTime;

    /** 反馈时间。 */
    private LocalDateTime feedbackTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
