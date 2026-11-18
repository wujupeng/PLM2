package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 编码规则分段保存请求。
 */
@Data
public class CodeRuleSegmentSaveRequest {

    @NotNull(message = "分段序号不能为空")
    private Integer segNo;

    @NotBlank(message = "分段名称不能为空")
    private String segName;

    @NotBlank(message = "分段业务键不能为空")
    private String segKey;

    @NotNull(message = "起始位不能为空")
    private Integer startPos;

    @NotNull(message = "结束位不能为空")
    private Integer endPos;

    @NotNull(message = "分段长度不能为空")
    private Integer segLength;

    /** 取值类型：FIXED/FIELD/DATE/DICT/SEQ，默认 FIXED。 */
    private String valueType = "FIXED";

    /** 固定值（value_type=FIXED 时使用）。 */
    private String fixedValue;

    /** 业务字段键（value_type=FIELD 时使用）。 */
    private String fieldKey;

    /** 码表类型（value_type=DICT 时使用）。 */
    private String dictType;

    /** 日期格式：YEAR_LAST1/YEAR2/DAY_OF_YEAR/MONTH2/DAY2/MONTH_CODE/DAY_CODE。 */
    private String datePattern;

    /** 日期偏移天数。 */
    private Integer dayOffset;

    /** 补位字符，默认 0。 */
    private String fillChar = "0";

    /** 补位方式：LEFT/RIGHT/NONE，默认 LEFT。 */
    private String fillMode = "LEFT";

    /** 取值来源说明。 */
    private String sourceRef;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：1 启用 / 0 停用，默认 1。 */
    private Integer status = 1;

    private String remark;
}
