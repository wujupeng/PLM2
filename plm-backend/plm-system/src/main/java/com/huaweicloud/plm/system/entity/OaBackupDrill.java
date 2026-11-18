package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 备份恢复演练（OA-DEV-110）：记录演练类型、备份来源、RPO/RTO 目标与实际、恢复结果与数据校验。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_backup_drill")
public class OaBackupDrill extends BaseEntity {

    /** 演练编号。 */
    private String drillNo;

    /** 演练名称。 */
    private String drillName;

    /** 演练类型：DB/FILE/FULL。 */
    private String drillType;

    /** 备份来源。 */
    private String backupSource;

    /** 备份时间。 */
    private LocalDateTime backupTime;

    /** 目标 RPO（分钟）。 */
    private Integer targetRpoMinutes;

    /** 目标 RTO（分钟）。 */
    private Integer targetRtoMinutes;

    /** 恢复开始时间。 */
    private LocalDateTime restoreStart;

    /** 恢复结束时间。 */
    private LocalDateTime restoreEnd;

    /** 实际 RPO（分钟）。 */
    private Integer actualRpoMinutes;

    /** 实际 RTO（分钟）。 */
    private Integer actualRtoMinutes;

    /** 恢复结果：SUCCESS/PARTIAL/FAILED/PENDING。 */
    private String restoreResult;

    /** 数据校验结果：0/1。 */
    private Integer dataVerified;

    /** 操作人员。 */
    private String operatorName;

    /** 演练时间。 */
    private LocalDateTime drillTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
