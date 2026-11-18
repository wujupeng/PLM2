package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 单个分段的取值与解析结果（N5）。
 */
@Data
public class CodeSegmentValueResponse {

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

    /** 分段取值（生成时为补齐后的值，解析时为切分出的值）。 */
    private String value;

    /** 取值名称（码表翻译）。 */
    private String valueName;

    /** 日期格式。 */
    private String datePattern;

    /** 码表类型。 */
    private String dictType;
}
