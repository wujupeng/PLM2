package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工序报工单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_work_report")
public class MesWorkReport extends BaseEntity {

    /** 报工单号。 */
    private String reportNo;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 派工单号。 */
    private String dispatchNo;

    /** 工序编码。 */
    private String processCode;

    /** 工序名称。 */
    private String processName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 设备编码。 */
    private String equipmentCode;

    /** 产线编码。 */
    private String lineCode;

    /** 操作工。 */
    private String operator;

    /** 班次编码。 */
    private String shiftCode;

    /** 报工类型，默认 START。 */
    private String reportType;

    /** 合格数量。 */
    private BigDecimal goodQty;

    /** 不良数量。 */
    private BigDecimal badQty;

    /** 返工数量。 */
    private BigDecimal reworkQty;

    /** 报工数量。 */
    private BigDecimal reportQty;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 时长（分钟）。 */
    private BigDecimal durationMinutes;

    /** 工时。 */
    private BigDecimal workHours;

    /** 报工状态，默认 DRAFT。 */
    private String reportStatus;

    /** 报工时间。 */
    private LocalDateTime reportTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
