package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 技术规格实例取值保存请求。
 */
@Data
public class SpecInstanceValueSaveRequest {

    @NotBlank(message = "字段编码不能为空")
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
