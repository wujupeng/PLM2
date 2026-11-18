package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 技术规格实例取值（DEV-043），逐字段记录电气性能指标取值与判定结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spec_instance_value")
public class SpecInstanceValue extends BaseEntity {

    /** 所属实例 ID。 */
    private Long instanceId;

    /** 字段编码。 */
    private String fieldCode;

    /** 字段名称。 */
    private String fieldName;

    /** 字段分类。 */
    private String fieldCategory;

    /** 单位。 */
    private String unit;

    /** 下限值。 */
    private BigDecimal minValue;

    /** 上限值。 */
    private BigDecimal maxValue;

    /** 目标值。 */
    private String targetValue;

    /** 文本取值。 */
    private String valueText;

    /** 数值取值。 */
    private BigDecimal valueNumber;

    /** 判定结果：0-超界 1-合格。 */
    private Integer passFlag;

    /** 检验方法。 */
    private String inspectionMethod;

    /** 排序号。 */
    private Integer sortNo;

    private String remark;
}
