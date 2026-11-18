package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 编码规则预览请求（不落库）。
 */
@Data
public class CodeRulePreviewRequest {

    /** 编码类型：CODE14/CODE24/CODE28。 */
    private String codeType;

    /** 编码规则编码。 */
    private String ruleCode;

    /** 编码总长度，为空时按编码类型推断。 */
    private Integer totalLength;

    /** 待预览的分段定义。 */
    private List<CodeRuleSegmentSaveRequest> segments;
}
