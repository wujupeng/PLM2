package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_form_definition")
public class OaFormDefinition extends BaseEntity {

    private String formCode;

    private String formName;

    private String category;

    private Integer versionNo;

    /** 表单状态：DRAFT/PUBLISHED/DISABLED。 */
    private String status;

    /** 表单设计器完整结构（JSON 文本），保留布局与组件配置。 */
    private String schemaJson;

    private String description;

    private String remark;
}
