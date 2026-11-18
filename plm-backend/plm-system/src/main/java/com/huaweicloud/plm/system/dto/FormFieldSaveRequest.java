package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FormFieldSaveRequest {

    @NotBlank(message = "字段编码不能为空")
    private String fieldCode;

    @NotBlank(message = "字段名称不能为空")
    private String fieldName;

    private String fieldType;

    private Integer requiredFlag;

    private String dataSource;

    private String sourceValue;

    private String optionsJson;

    private String rulesJson;

    private String placeholder;

    private Integer sortNo;

    private String remark;
}
