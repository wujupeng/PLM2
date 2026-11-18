package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * MES 设备状态记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_equipment_status")
public class MesEquipmentStatus extends BaseEntity {

    /** 状态单号。 */
    private String statusNo;

    /** 设备编码。 */
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 状态类型，默认 RUNNING。 */
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

    /** 记录状态，默认 DRAFT。 */
    private String recordStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
