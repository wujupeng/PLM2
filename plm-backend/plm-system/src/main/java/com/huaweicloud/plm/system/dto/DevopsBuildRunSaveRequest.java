package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 构建部署记录保存请求（G1-N7 WBS T012）。
 */
@Data
public class DevopsBuildRunSaveRequest {

    /** 运行编号（为空时自动生成）。 */
    private String runNo;

    /** 流水线编码（必填）。 */
    @NotBlank(message = "流水线编码不能为空")
    private String pipelineCode;

    /** 构建号。 */
    private String buildNo;

    /** 环境编码。 */
    private String envCode;

    /** 提交号。 */
    private String commitId;

    /** 构建状态，为空默认 RUNNING。 */
    private String buildStatus;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 耗时（毫秒）。 */
    private Long durationMs;

    /** 制品引用。 */
    private String artifactRef;

    /** 消息。 */
    private String message;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
