package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 迁移批次保存请求（OA-DEV-097/100/101）。
 */
@Data
public class BizMigrationBatchSaveRequest {

    /** 批次编号。 */
    private String batchNo;

    /** 批次名称。 */
    @NotBlank(message = "批次名称不能为空")
    private String batchName;

    /** 对象编码。 */
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

    /** 批次状态。 */
    private String batchStatus;

    /** 试迁轮次。 */
    private Integer trialRound;

    /** 开始时间（yyyy-MM-dd HH:mm:ss）。 */
    private String startTime;

    /** 结束时间（yyyy-MM-dd HH:mm:ss）。 */
    private String endTime;

    /** 备注。 */
    private String remark;
}
