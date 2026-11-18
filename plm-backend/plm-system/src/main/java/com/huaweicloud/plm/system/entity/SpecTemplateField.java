package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 技术规格模板字段明细（DEV-042）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spec_template_field")
public class SpecTemplateField extends BaseEntity {

    /** 所属模板 ID。 */
    private Long templateId;

    /** 字段编码。 */
    private String fieldCode;

    /** 字段名称。 */
    private String fieldName;

    /** 字段分类。 */
    private String fieldCategory;

    /** 数据类型：number/range/text/bool/option。 */
    private String dataType;

    /** 单位。 */
    private String unit;

    /** 下限值。 */
    private BigDecimal minValue;

    /** 上限值。 */
    private BigDecimal maxValue;

    /** 目标值。 */
    private String targetValue;

    /** 是否必填：0-否 1-是。 */
    private Integer requiredFlag;

    /** 默认值。 */
    private String defaultValue;

    /** 可选值列表，逗号分隔。 */
    private String optionsText;

    /** 检验方法。 */
    private String inspectionMethod;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：0-停用 1-启用。 */
    private Integer status;

    private String remark;
}
