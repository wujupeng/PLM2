package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 召回单保存请求（N8，DEV-094）。
 */
@Data
public class MfgRecallSaveRequest {

    /** 召回单号（可选，留空自动生成）。 */
    private String recallNo;

    /** 召回类型：MATERIAL_BATCH/PRODUCTION_BATCH/CUSTOMER/DATE_RANGE。 */
    @NotBlank(message = "召回类型不能为空")
    private String recallType;

    /** 触发来源。 */
    private String triggerSource;

    /** 目标值（批次号/客户/日期范围等）。 */
    @NotBlank(message = "召回目标值不能为空")
    private String targetValue;

    /** 风险等级：LOW/MEDIUM/HIGH。 */
    private String riskLevel;

    /** 责任人。 */
    private String owner;

    /** 召回原因。 */
    private String reason;

    private String remark;
}
