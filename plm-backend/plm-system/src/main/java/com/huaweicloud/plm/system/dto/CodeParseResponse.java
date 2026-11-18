package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 编码解析结果（N5）。
 */
@Data
public class CodeParseResponse {

    /** 编码。 */
    private String code;

    /** 编码类型。 */
    private String codeType;

    /** 编码长度。 */
    private Integer codeLength;

    /** 是否有效。 */
    private Boolean validFlag;

    /** 失败原因。 */
    private String failReason;

    /** 编码规则 ID。 */
    private Long ruleId;

    /** 编码规则编码。 */
    private String ruleCode;

    /** 反推的生成日期。 */
    private LocalDate parsedDate;

    /** 流水号数值。 */
    private Integer sequenceValue;

    /** 分段明细。 */
    private List<CodeSegmentValueResponse> segments;

    /** 解析出的字段值集合。 */
    private Map<String, String> fieldValues;

    /** 告警提示集合。 */
    private List<String> warnings;
}
