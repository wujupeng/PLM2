package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 工程变更影响分析请求。
 */
@Data
public class EcoImpactAnalyzeRequest {

    /** 需要分析的影响类型，为空时取配置 eco.impact.types。 */
    private List<String> includeTypes;
}
