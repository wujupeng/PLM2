package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 图文档分类（DEV-033）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("doc_category")
public class DocCategory extends BaseEntity {

    /** 分类编码。 */
    private String categoryCode;

    /** 分类名称。 */
    private String categoryName;

    /** 父分类 ID，顶级为 0。 */
    private Long parentId;

    /** 图文档类型：drawing/document 等。 */
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
