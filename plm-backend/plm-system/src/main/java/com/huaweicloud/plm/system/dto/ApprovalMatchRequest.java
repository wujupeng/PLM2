package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

/**
 * 审批流匹配请求（G1-N6 WBS T103 可配置审批）：
 * 按单据类型与业务模块匹配生效审批流，values 为业务单据的字段取值，供审批条件引擎评估。
 */
@Data
public class ApprovalMatchRequest {

    /** 单据类型。 */
    @NotBlank(message = "单据类型不能为空")
    private String docType;

    /** 业务模块。 */
    private String bizModule;

    /** 业务字段取值（键为字段标识，值为实际取值）。 */
    private Map<String, Object> values;
}
