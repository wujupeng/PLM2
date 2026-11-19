package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 标签追溯同步批次记录：登记标签追溯推送对象的集成同步批次编号、名称、所属接口、方向、对象类型、
 * 触发方式、总数/成功数/失败数、起止时间、状态、消息及组织信息，支撑集成同步批次管理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("intg_label_trace_batch")
public class IntgLabelTraceBatch extends BaseEntity {

    /** 批次编号（唯一，为空时自动生成）。 */
    private String batchNo;

    /** 批次名称。 */
    private String batchName;

    /** 所属接口编号。 */
    private String interfaceNo;

    /** 集成方向，默认 TRACE_TO_SYSTEMS。 */
    private String direction;

    /** 集成对象类型，默认 DATA_MATRIX。 */
    private String objectType;

    /** 触发方式，默认 MANUAL。 */
    private String triggerType;

    /** 同步总条数，默认 0。 */
    private Integer totalCount;

    /** 成功条数，默认 0。 */
    private Integer successCount;

    /** 失败条数，默认 0。 */
    private Integer failCount;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 批次状态，默认 PENDING。 */
    private String batchStatus;

    /** 执行消息。 */
    private String message;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
