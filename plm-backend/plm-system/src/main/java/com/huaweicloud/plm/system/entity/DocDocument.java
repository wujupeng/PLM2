package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 图文档主档（DEV-034）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("doc_document")
public class DocDocument extends BaseEntity {

    /** 图文档编号。 */
    private String docNo;

    /** 图文档名称。 */
    private String docName;

    /** 分类 ID。 */
    private Long categoryId;

    /** 分类编码。 */
    private String categoryCode;

    /** 图文档类型。 */
    private String docType;

    /** 关联产品编码。 */
    private String productCode;

    /** 关联物料编码。 */
    private String materialCode;

    /** 关联 BOM 头 ID。 */
    private Long bomHeaderId;

    /** 关联 BOM 编码。 */
    private String bomCode;

    /** 当前文件名。 */
    private String fileName;

    /** 当前版本号，如 V1。 */
    private String currentVersionNo;

    /** 状态：draft/in_review/approved/released/obsolete。 */
    private String status;

    /** 是否受控分发：0-否 1-是。 */
    private Integer distributionControlled;

    /** 负责人 ID。 */
    private Long ownerId;

    /** 负责人名称。 */
    private String ownerName;

    /** 图文档描述。 */
    private String description;

    private String remark;
}
