package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 编码生成结果（N5）。
 */
@Data
public class CodeGenerateResponse {

    /** 生成编码（qty>1 时为首个）。 */
    private String code;

    /** 编码类型。 */
    private String codeType;

    /** 编码规则 ID。 */
    private Long ruleId;

    /** 编码规则编码。 */
    private String ruleCode;

    /** 生成日期。 */
    private LocalDate generateDate;

    /** 流水号数值。 */
    private Integer sequenceValue;

    /** 流水号文本。 */
    private String sequenceCode;

    /** 是否触发流水号预警。 */
    private Boolean sequenceWarn;

    /** 流水号预警提示。 */
    private String sequenceMessage;

    /** 首个编码的分段明细。 */
    private List<CodeSegmentValueResponse> segments;

    /** 告警提示集合。 */
    private List<String> warnings;

    /** 全部生成的编码（qty>1 时返回）。 */
    private List<String> codes;
}
