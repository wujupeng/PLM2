package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

/**
 * 规则求值请求（G1-N6 WBS T104 业务规则引擎）：
 * 按规则类型（可选业务模块）匹配生效规则，inputData 为业务输入数据，供规则参数与表达式评估。
 */
@Data
public class RuleEvaluateRequest {

    /** 规则类型。 */
    @NotBlank(message = "规则类型不能为空")
    private String ruleType;

    /** 业务模块（非空时同时按业务模块过滤）。 */
    private String bizModule;

    /** 业务主键。 */
    private String bizKey;

    /** 业务输入数据（键为字段标识，值为实际取值）。 */
    private Map<String, Object> inputData;
}
