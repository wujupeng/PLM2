package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 图文档关联关系（DEV-036）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("doc_relation")
public class DocRelation extends BaseEntity {

    /** 所属图文档 ID。 */
    private Long documentId;

    /** 图文档编号。 */
    private String docNo;

    /** 关联类型：part/bom/product 等。 */
    private String relationType;

    /** 关联对象 ID。 */
    private Long targetId;

    /** 关联对象编码。 */
    private String targetCode;

    /** 关联对象名称。 */
    private String targetName;

    /** 关联角色，如 主图/装配图。 */
    private String relationRole;

    private String remark;
}
