package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 迁移对账保存请求（OA-DEV-103）。
 */
@Data
public class BizMigrationReconcileSaveRequest {

    /** 对账单号。 */
    private String reconcileNo;

    /** 所属批次ID。 */
    private Long batchId;

    /** 所属批次编号。 */
    private String batchNo;

    /** 对象编码。 */
    @NotBlank(message = "对象编码不能为空")
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

    /** 报告时间（yyyy-MM-dd HH:mm:ss）。 */
    private String reportTime;

    /** 备注。 */
    private String remark;
}
