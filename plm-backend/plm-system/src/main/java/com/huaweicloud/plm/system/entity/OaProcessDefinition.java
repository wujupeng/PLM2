package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_process_definition")
public class OaProcessDefinition extends BaseEntity {

    private String processCode;

    private String processName;

    private Long formId;

    private String category;

    private Integer versionNo;

    /** 流程状态：DRAFT/PUBLISHED/DISABLED。 */
    private String status;

    /** 流程设计器完整结构（JSON 文本），保留连线与节点坐标。 */
    private String definitionJson;

    private String description;

    private String remark;
}
