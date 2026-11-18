package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_form_field")
public class OaFormField extends BaseEntity {

    private Long formId;

    private String fieldCode;

    private String fieldName;

    /** 字段类型：TEXT/TEXTAREA/NUMBER/AMOUNT/DATE/DATETIME/SELECT/MULTI_SELECT/USER/ORG。 */
    private String fieldType;

    /** 1=必填，0=非必填。 */
    private Integer requiredFlag;

    /** 数据来源：MANUAL/DICT/USER/ORG/FORMULA。 */
    private String dataSource;

    /** 数据来源参数，如字典类型编码。 */
    private String sourceValue;

    /** 下拉选项（JSON 文本）。 */
    private String optionsJson;

    /** 校验规则（JSON 文本）。 */
    private String rulesJson;

    private String placeholder;

    private Integer sortNo;

    private String remark;
}
