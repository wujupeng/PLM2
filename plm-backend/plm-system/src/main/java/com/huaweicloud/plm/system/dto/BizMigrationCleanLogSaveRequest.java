package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 数据清洗日志保存请求（OA-DEV-098）：保留原值与清洗值，不覆盖原始数据。
 */
@Data
public class BizMigrationCleanLogSaveRequest {

    /** 所属批次ID。 */
    private Long batchId;

    /** 触发规则ID。 */
    private Long ruleId;

    /** 触发规则编号。 */
    private String ruleNo;

    /** 对象编码。 */
    @NotBlank(message = "对象编码不能为空")
    private String objectCode;

    /** 记录标识（源主键）。 */
    private String recordKey;

    /** 源值。 */
    private String sourceValue;

    /** 清洗后取值。 */
    private String cleanedValue;

    /** 清洗结果：CLEANED/SKIPPED/FAILED。 */
    private String cleanResult;

    /** 处理说明。 */
    private String message;

    /** 清洗时间（yyyy-MM-dd HH:mm:ss）。 */
    private String cleanTime;

    /** 备注。 */
    private String remark;
}
