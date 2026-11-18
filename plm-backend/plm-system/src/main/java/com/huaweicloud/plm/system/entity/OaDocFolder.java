package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 文档目录：公共、部门、项目、个人、共享、流程归档与知识库目录，支持多层级。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_doc_folder")
public class OaDocFolder extends BaseEntity {

    private String folderCode;

    private String folderName;

    /** 目录类型：PUBLIC/DEPARTMENT/PROJECT/PERSONAL/SHARED/ARCHIVE/KNOWLEDGE。 */
    private String folderType;

    /** 上级目录ID，根目录为 0。 */
    private Long parentId;

    /** 物化路径，形如 /PUBLIC_ROOT/KNOWLEDGE_ISO，用于按层级前缀检索子目录。 */
    private String folderPath;

    private Integer folderLevel;

    private Long ownerUserId;

    private Long ownerDeptId;

    /** 知识库分类编码（ISO/LESSON/CUSTOMER/QUALITY 等），非知识库目录为空。 */
    private String categoryCode;

    private Integer sortNo;

    private String status;

    private String remark;
}
