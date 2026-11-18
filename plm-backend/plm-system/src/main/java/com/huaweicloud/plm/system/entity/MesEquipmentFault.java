package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 设备故障记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_equipment_fault")
public class MesEquipmentFault extends BaseEntity {

    /** 故障单号。 */
    private String faultNo;

    /** 设备编码。 */
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 故障类型。 */
    private String faultType;

    /** 故障等级，默认 MEDIUM。 */
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

    /** 故障状态，默认 DRAFT。 */
    private String faultStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
