package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 迁移批次（OA-DEV-097/100/101）：抽取批次与全量/增量试迁批次，保留原始快照与校验值。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_batch")
public class OaMigrationBatch extends BaseEntity {

    /** 批次编号。 */
    private String batchNo;

    /** 批次名称。 */
    private String batchName;

    /** 对象编码（可空，表示跨对象批次）。 */
    private String objectCode;

    /** 批次类型：FULL/INCREMENT/EXTRACT/ATTACHMENT。 */
    private String batchType;

    /** 抽取方式：API/DB/FILE/EXPORT。 */
    private String extractMethod;

    /** 原始快照位置。 */
    private String sourceSnapshot;

    /** 快照校验值。 */
    private String snapshotChecksum;

    /** 总条数。 */
    private Long totalCount;

    /** 成功条数。 */
    private Long successCount;

    /** 失败条数。 */
    private Long failCount;

    /** 跳过条数。 */
    private Long skipCount;

    /** 批次状态：PENDING/RUNNING/SUCCESS/FAILED/PARTIAL。 */
    private String batchStatus;

    /** 试迁轮次。 */
    private Integer trialRound;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 执行人姓名。 */
    private String operatorName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
