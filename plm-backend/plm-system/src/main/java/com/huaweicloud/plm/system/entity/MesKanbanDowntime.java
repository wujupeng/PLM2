package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 停机看板记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_kanban_downtime")
public class MesKanbanDowntime extends BaseEntity {

    /** 停机单号。 */
    private String downtimeNo;

    /** 设备编码。 */
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 产线编码。 */
    private String lineCode;

    /** 停机类型，默认 EQUIPMENT。 */
    private String downtimeType;

    /** 停机开始时间。 */
    private LocalDateTime startTime;

    /** 停机结束时间。 */
    private LocalDateTime endTime;

    /** 停机时长（分钟）。 */
    private BigDecimal durationMinutes;

    /** 停机原因。 */
    private String reason;

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
