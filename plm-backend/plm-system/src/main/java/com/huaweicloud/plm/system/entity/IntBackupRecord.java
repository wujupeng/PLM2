package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 备份恢复记录（N9，DEV-103）：备份、恢复与容灾演练记录，核对 RPO/RTO 目标。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_backup_record")
public class IntBackupRecord extends BaseEntity {

    /** 记录编号（唯一）。 */
    private String recordNo;

    /** 记录类型：BACKUP/RESTORE/DRILL。 */
    private String recordType;

    /** 范围：DB/FILE/FULL。 */
    private String scope;

    /** 备份时间。 */
    private LocalDateTime backupAt;

    /** 备份大小（MB）。 */
    private BigDecimal sizeMb;

    /** 存放路径。 */
    private String targetPath;

    /** RPO（分钟）。 */
    private Integer rpoMinutes;

    /** RTO（分钟）。 */
    private Integer rtoMinutes;

    /** 实际耗时（分钟）。 */
    private Integer elapsedMinutes;

    /** 结果状态：SUCCESS/FAILED。 */
    private String resultStatus;

    /** 是否已验证：1 是 / 0 否。 */
    private Integer verified;

    /** 操作人。 */
    private String operator;

    private String remark;
}
