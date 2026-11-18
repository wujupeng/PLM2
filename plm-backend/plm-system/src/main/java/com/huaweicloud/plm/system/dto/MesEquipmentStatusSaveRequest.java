package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * MES 设备状态记录保存请求。
 */
@Data
public class MesEquipmentStatusSaveRequest {

    /** 状态单号（为空时自动生成）。 */
    private String statusNo;

    /** 设备编码。 */
    @NotBlank(message = "设备编码不能为空")
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 状态类型，为空默认 RUNNING。 */
    private String statusType;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 持续时长（分钟）。 */
    private BigDecimal durationMinutes;

    /** 操作人。 */
    private String operator;

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
