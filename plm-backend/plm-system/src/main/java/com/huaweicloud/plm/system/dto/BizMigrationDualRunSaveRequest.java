package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 新旧流程双跑对照保存请求（OA-DEV-104）。
 */
@Data
public class BizMigrationDualRunSaveRequest {

    /** 对照编号。 */
    private String dualNo;

    /** 流程编码。 */
    private String processCode;

    /** 流程名称。 */
    @NotBlank(message = "流程名称不能为空")
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

    /** 运行时间（yyyy-MM-dd HH:mm:ss）。 */
    private String runTime;

    /** 备注。 */
    private String remark;
}
