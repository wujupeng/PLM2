package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 迁移对账（OA-DEV-103）：按对象统计源/目标/成功/失败/跳过/差异数量与处理结论。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_reconcile")
public class OaMigrationReconcile extends BaseEntity {

    /** 对账单号。 */
    private String reconcileNo;

    /** 所属批次ID。 */
    private Long batchId;

    /** 所属批次编号。 */
    private String batchNo;

    /** 对象编码。 */
    private String objectCode;

    /** 源数量。 */
    private Long sourceCount;

    /** 目标数量。 */
    private Long targetCount;

    /** 成功数量。 */
    private Long successCount;

    /** 失败数量。 */
    private Long failCount;

    /** 跳过数量。 */
    private Long skipCount;

    /** 差异数量。 */
    private Long diffCount;

    /** 差异原因。 */
    private String diffReason;

    /** 对账结论。 */
    private String conclusion;

    /** 对账状态：PENDING/CONFIRMED/EXCEPTION。 */
    private String reconcileStatus;

    /** 报告时间。 */
    private LocalDateTime reportTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
