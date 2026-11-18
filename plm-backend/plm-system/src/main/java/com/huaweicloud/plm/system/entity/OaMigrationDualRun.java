package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 新旧流程双跑对照（OA-DEV-104）：比较审批人、路径、计算字段、通知与最终结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_dual_run")
public class OaMigrationDualRun extends BaseEntity {

    /** 对照编号。 */
    private String dualNo;

    /** 流程编码。 */
    private String processCode;

    /** 流程名称。 */
    private String processName;

    /** 业务标识。 */
    private String bizKey;

    /** 新系统流程实例ID。 */
    private Long newInstanceId;

    /** 旧系统流程单号。 */
    private String oldInstanceNo;

    /** 对照结果：PENDING/MATCH/DIFF。 */
    private String compareResult;

    /** 审批人差异。 */
    private String approverDiff;

    /** 路径差异。 */
    private String pathDiff;

    /** 计算字段差异。 */
    private String fieldDiff;

    /** 通知差异。 */
    private String notifyDiff;

    /** 最终结果差异。 */
    private String resultDiff;

    /** 对照结论。 */
    private String conclusion;

    /** 运行时间。 */
    private LocalDateTime runTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
