package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 设备故障记录保存请求。
 */
@Data
public class MesEquipmentFaultSaveRequest {

    /** 故障单号（为空时自动生成）。 */
    private String faultNo;

    /** 设备编码。 */
    @NotBlank(message = "设备编码不能为空")
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 故障类型。 */
    private String faultType;

    /** 故障等级，为空默认 MEDIUM。 */
    private String faultLevel;

    /** 故障描述。 */
    private String faultDesc;

    /** 发生时间。 */
    private LocalDateTime occurTime;

    /** 报修人。 */
    private String reporter;

    /** 维修人。 */
    private String repairer;

    /** 维修完成时间。 */
    private LocalDateTime repairTime;

    /** 停机时长（分钟）。 */
    private BigDecimal downtimeMinutes;

    /** 故障状态，为空默认 DRAFT。 */
    private String faultStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
