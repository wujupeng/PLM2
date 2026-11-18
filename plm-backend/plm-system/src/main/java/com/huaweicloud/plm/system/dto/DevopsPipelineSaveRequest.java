package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 流水线保存请求（G1-N7 WBS T012）。
 */
@Data
public class DevopsPipelineSaveRequest {

    /** 流水线编号（为空时自动生成）。 */
    private String pipelineNo;

    /** 流水线编码（必填且唯一）。 */
    @NotBlank(message = "流水线编码不能为空")
    private String pipelineCode;

    /** 流水线名称。 */
    @NotBlank(message = "流水线名称不能为空")
    private String pipelineName;

    /** 关联仓库编码。 */
    private String repoCode;

    /** 触发方式，为空默认 PUSH。 */
    private String triggerType;

    /** 流水线状态，为空默认 ACTIVE。 */
    private String pipelineStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
