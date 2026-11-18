package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.OaFormDefinition;
import com.huaweicloud.plm.system.entity.OaFormField;
import lombok.Data;

import java.util.List;

/**
 * 表单详情：表单定义 + 字段清单。
 */
@Data
public class FormDetailResponse {

    private OaFormDefinition form;

    private List<OaFormField> fields;
}
