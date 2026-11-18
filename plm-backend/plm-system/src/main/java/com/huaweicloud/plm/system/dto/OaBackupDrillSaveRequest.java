package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 备份恢复演练保存请求（OA-DEV-110）。
 */
@Data
public class OaBackupDrillSaveRequest {

    /** 演练编号。 */
    private String drillNo;

    /** 演练名称。 */
    @NotBlank(message = "演练名称不能为空")
    private String drillName;

    /** 演练类型。 */
    private String drillType;

    /** 备份来源。 */
    private String backupSource;

    /** 备份时间（yyyy-MM-dd HH:mm:ss）。 */
    private String backupTime;

    /** 目标 RPO（分钟）。 */
    private Integer targetRpoMinutes;

    /** 目标 RTO（分钟）。 */
    private Integer targetRtoMinutes;

    /** 恢复开始时间（yyyy-MM-dd HH:mm:ss）。 */
    private String restoreStart;

    /** 恢复结束时间（yyyy-MM-dd HH:mm:ss）。 */
    private String restoreEnd;

    /** 实际 RPO（分钟）。 */
    private Integer actualRpoMinutes;

    /** 实际 RTO（分钟）。 */
    private Integer actualRtoMinutes;

    /** 恢复结果。 */
    private String restoreResult;

    /** 数据校验结果：0/1。 */
    private Integer dataVerified;

    /** 操作人员。 */
    private String operatorName;

    /** 演练时间（yyyy-MM-dd HH:mm:ss）。 */
    private String drillTime;

    /** 备注。 */
    private String remark;
}
