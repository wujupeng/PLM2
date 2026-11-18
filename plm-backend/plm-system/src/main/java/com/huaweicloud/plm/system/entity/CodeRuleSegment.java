package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 编码规则分段定义（DEV-051 / DEV-052 / DEV-062）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("code_rule_segment")
public class CodeRuleSegment extends BaseEntity {

    /** 所属编码规则 ID。 */
    private Long ruleId;

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

    /** 补位字符。 */
    private String fillChar;

    /** 补位方式：LEFT/RIGHT/NONE。 */
    private String fillMode;

    /** 取值来源说明。 */
    private String sourceRef;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    private String remark;
}
