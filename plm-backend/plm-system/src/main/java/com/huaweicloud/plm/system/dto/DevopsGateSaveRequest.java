package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 质量与安全门禁保存请求（G1-N7 WBS T012）。
 */
@Data
public class DevopsGateSaveRequest {

    /** 门禁编号（为空时自动生成）。 */
    private String gateNo;

    /** 流水线编码（必填）。 */
    @NotBlank(message = "流水线编码不能为空")
    private String pipelineCode;

    /** 运行编号。 */
    private String runNo;

    /** 门禁名称。 */
    @NotBlank(message = "门禁名称不能为空")
    private String gateName;

    /** 门禁类型，为空默认 UNIT_TEST。 */
    private String gateType;

    /** 阈值表达式。 */
    private String thresholdExpr;

    /** 问题数，为空默认 0。 */
    private Integer issueCount;

    /** 严重级别。 */
    private String severity;

    /** 门禁结果，为空默认 PASS。 */
    private String gateResult;

    /** 检查时间。 */
    private LocalDateTime checkTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
