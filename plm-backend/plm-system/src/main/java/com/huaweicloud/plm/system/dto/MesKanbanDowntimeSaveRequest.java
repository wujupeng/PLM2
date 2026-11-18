package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 停机看板记录保存请求。
 */
@Data
public class MesKanbanDowntimeSaveRequest {

    /** 停机单号（为空时自动生成）。 */
    private String downtimeNo;

    /** 设备编码。 */
    @NotBlank(message = "设备编码不能为空")
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 产线编码。 */
    private String lineCode;

    /** 停机类型，为空默认 EQUIPMENT。 */
    private String downtimeType;

    /** 停机开始时间。 */
    private LocalDateTime startTime;

    /** 停机结束时间。 */
    private LocalDateTime endTime;

    /** 停机时长（分钟）。 */
    private BigDecimal durationMinutes;

    /** 停机原因。 */
    private String reason;

    /** 记录状态，为空默认 DRAFT。 */
    private String recordStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
