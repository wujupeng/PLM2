package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 设备保养记录保存请求。
 */
@Data
public class MesEquipmentMaintenanceSaveRequest {

    /** 保养单号（为空时自动生成）。 */
    private String maintenanceNo;

    /** 设备编码。 */
    @NotBlank(message = "设备编码不能为空")
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 保养类型，为空默认 DAILY。 */
    private String maintenanceType;

    /** 计划时间。 */
    private LocalDateTime planTime;

    /** 实际时间。 */
    private LocalDateTime actualTime;

    /** 保养人。 */
    private String maintainer;

    /** 费用。 */
    private BigDecimal cost;

    /** 保养状态，为空默认 DRAFT。 */
    private String maintenanceStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
