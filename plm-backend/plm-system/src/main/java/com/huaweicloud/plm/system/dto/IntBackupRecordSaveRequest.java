package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 备份恢复记录保存请求（N9，DEV-103）。 */
@Data
public class IntBackupRecordSaveRequest {

    /** 记录编号（留空则自动生成）。 */
    private String recordNo;

    /** 记录类型。 */
    @NotBlank(message = "记录类型不能为空")
    private String recordType;

    /** 范围。 */
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

    /** 结果状态。 */
    private String resultStatus;

    /** 是否已验证：0 否 / 1 是。 */
    private Integer verified;

    /** 操作人。 */
    private String operator;

    /** 备注。 */
    private String remark;
}
