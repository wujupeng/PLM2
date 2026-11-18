package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.SpecTemplate;
import com.huaweicloud.plm.system.entity.SpecTemplateField;
import lombok.Data;

import java.util.List;

/**
 * 技术规格模板详情：模板本体与字段明细。
 */
@Data
public class SpecTemplateDetailResponse {

    private SpecTemplate template;

    private List<SpecTemplateField> fields;
}
