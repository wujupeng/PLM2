package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 排产计划：登记排产单号、生产工单、物料信息、产线、计划与已排产数量、排产时间窗、
 * 排产状态、排产人及组织信息，支撑 MES 排产登记与进度追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_schedule")
public class MesSchedule extends BaseEntity {

    /** 排产单号。 */
    private String scheduleNo;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 产线编码。 */
    private String lineCode;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 已排产数量。 */
    private BigDecimal scheduledQty;

    /** 排产开始时间。 */
    private LocalDateTime scheduleStartTime;

    /** 排产结束时间。 */
    private LocalDateTime scheduleEndTime;

    /** 排产状态，默认 DRAFT。 */
    private String scheduleStatus;

    /** 排产人。 */
    private String scheduler;

    /** 排产时间。 */
    private LocalDateTime scheduleTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
