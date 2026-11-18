package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 编码生成结果（G1-N6 WBS T105 数据质量控制）：
 * 返回生成编码及自增后的当前流水值，供各系统落库时记录.
 */
@Data
public class CodeRuleGenerateResult {

    /** 编码规则ID。 */
    private Long codeRuleId;

    /** 编码规则名称。 */
    private String codeName;

    /** 目标实体。 */
    private String targetEntity;

    /** 生成的编码。 */
    private String generatedCode;

    /** 自增后的当前流水值。 */
    private Integer currentSeq;
}
