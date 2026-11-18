package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 规则求值结果（G1-N6 WBS T104 业务规则引擎）。
 */
@Data
public class RuleEvaluateResult {

    /** 命中规则编码（未命中为 null）。 */
    private String ruleCode;

    /** 命中规则名称（未命中为 null）。 */
    private String ruleName;

    /** 命中规则类型（未命中为 null）。 */
    private String ruleType;

    /** 是否命中。 */
    private boolean matched;

    /** 命中规则参数（paramKey → paramValue，按 valueType 转换；未命中为空 Map）。 */
    private Map<String, Object> params = new LinkedHashMap<>();

    /** 匹配结果：MATCH/NOT_MATCH。 */
    private String matchResult;
}
