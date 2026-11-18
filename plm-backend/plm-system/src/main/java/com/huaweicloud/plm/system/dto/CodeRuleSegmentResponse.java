package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.CodeRuleSegment;
import lombok.Data;
import org.springframework.beans.BeanUtils;

/**
 * 编码规则分段返回结构。
 */
@Data
public class CodeRuleSegmentResponse {

    /** 分段序号。 */
    private Integer segNo;

    /** 分段名称。 */
    private String segName;

    /** 分段业务键。 */
    private String segKey;

    /** 起始位（从 1 开始）。 */
    private Integer startPos;

    /** 结束位（含）。 */
    private Integer endPos;

    /** 分段长度。 */
    private Integer segLength;

    /** 取值类型：FIXED/FIELD/DATE/DICT/SEQ。 */
    private String valueType;

    /** 固定值。 */
    private String fixedValue;

    /** 业务字段键。 */
    private String fieldKey;

    /** 码表类型。 */
    private String dictType;

    /** 日期格式。 */
    private String datePattern;

    /** 日期偏移天数。 */
    private Integer dayOffset;

    /** 补位字符。 */
    private String fillChar;

    /** 补位方式：LEFT/RIGHT/NONE。 */
    private String fillMode;

    /** 取值来源说明。 */
    private String sourceRef;

    private String remark;

    public static CodeRuleSegmentResponse from(CodeRuleSegment seg) {
        CodeRuleSegmentResponse response = new CodeRuleSegmentResponse();
        if (seg != null) {
            BeanUtils.copyProperties(seg, response);
        }
        return response;
    }
}
