package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 图文档关联关系保存请求。
 */
@Data
public class DocRelationSaveRequest {

    @NotBlank(message = "关联类型不能为空")
    private String relationType;

    /** 关联对象 ID。 */
    private Long targetId;

    /** 关联对象编码。 */
    private String targetCode;

    /** 关联对象名称。 */
    private String targetName;

    /** 关联角色。 */
    private String relationRole;

    private String remark;
}
