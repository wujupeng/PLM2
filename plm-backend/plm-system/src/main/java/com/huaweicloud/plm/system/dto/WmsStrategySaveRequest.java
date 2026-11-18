package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 作业策略保存请求（对应作业策略）。
 */
@Data
public class WmsStrategySaveRequest {

    /** 策略编码（为空时自动生成）。 */
    @NotBlank(message = "作业策略编码不能为空")
    private String strategyCode;

    /** 策略名称。 */
    private String strategyName;

    /** 策略类型，为空默认 PUTAWAY。 */
    private String strategyType;

    /** 优先级，为空默认 0。 */
    private Integer priority;

    /** 先进先出标识，为空默认 0。 */
    private Integer fifoFlag;

    /** 规则内容。 */
    private String ruleContent;

    /** 策略状态，为空默认 DRAFT。 */
    private String strategyStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
