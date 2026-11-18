package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 物料分类保存请求。
 */
@Data
public class MaterialCategorySaveRequest {

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    /** 上级分类 ID，0 表示顶级分类。 */
    private Long parentId;

    /** 编码规则配置键。 */
    private String codeRuleKey;

    /** 该分类必填字段，逗号分隔。 */
    private String requiredFields;

    private Integer sortNo;

    /** 状态：1=启用，0=停用。 */
    private Integer status;

    private String remark;
}
