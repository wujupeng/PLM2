package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 技术规格模板字段明细保存请求。
 */
@Data
public class SpecTemplateFieldSaveRequest {

    @NotBlank(message = "字段编码不能为空")
    private String fieldCode;

    @NotBlank(message = "字段名称不能为空")
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
