package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * CAD 属性映射保存请求。
 */
@Data
public class CadAttrMappingSaveRequest {

    @NotBlank(message = "CAD 属性名不能为空")
    private String cadAttrName;

    /** CAD 属性显示名。 */
    private String cadAttrLabel;

    @NotBlank(message = "PLM 字段名不能为空")
    private String plmFieldName;

    /** PLM 字段显示名。 */
    private String plmFieldLabel;

    /** 目标实体，为空时按 document 处理。 */
    private String targetEntity;

    /** 是否必填：0-否 1-是。 */
    private Integer requiredFlag;

    /** 转换规则。 */
    private String transformRule;

    /** 默认值。 */
    private String defaultValue;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：0-停用 1-启用。 */
    private Integer status;

    private String remark;
}
