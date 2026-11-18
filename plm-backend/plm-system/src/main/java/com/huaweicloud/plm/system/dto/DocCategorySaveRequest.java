package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 图文档分类保存请求。
 */
@Data
public class DocCategorySaveRequest {

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    /** 父分类 ID，顶级为 0。 */
    private Long parentId;

    /** 图文档类型。 */
    private String docType;

    /** 允许的文件类型，逗号分隔。 */
    private String fileTypes;

    /** 必填元数据字段，逗号分隔。 */
    private String requiredMetadata;

    /** 是否需要评审：0-否 1-是。 */
    private Integer reviewRequired;

    /** 评审节点，逗号分隔。 */
    private String reviewNodes;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：0-停用 1-启用。 */
    private Integer status;

    private String remark;
}
