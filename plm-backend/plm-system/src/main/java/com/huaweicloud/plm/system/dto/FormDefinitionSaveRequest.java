package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class FormDefinitionSaveRequest {

    @NotBlank(message = "表单编码不能为空")
    private String formCode;

    @NotBlank(message = "表单名称不能为空")
    private String formName;

    private String category;

    private String status;

    private String schemaJson;

    private String description;

    private String remark;

    /** 表单字段清单，保存时全量覆盖。 */
    private List<FormFieldSaveRequest> fields;
}
