package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 设备保养记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_equipment_maintenance")
public class MesEquipmentMaintenance extends BaseEntity {

    /** 保养单号。 */
    private String maintenanceNo;

    /** 设备编码。 */
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 保养类型，默认 DAILY。 */
    private String maintenanceType;

    /** 计划时间。 */
    private LocalDateTime planTime;

    /** 实际时间。 */
    private LocalDateTime actualTime;

    /** 保养人。 */
    private String maintainer;

    /** 费用。 */
    private BigDecimal cost;

    /** 保养状态，默认 DRAFT。 */
    private String maintenanceStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
