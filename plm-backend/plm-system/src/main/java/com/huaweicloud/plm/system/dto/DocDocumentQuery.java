package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 图文档分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocDocumentQuery extends PageQuery {

    /** 分类编码。 */
    private String categoryCode;

    /** 图文档类型。 */
    private String docType;

    /** 关联产品编码。 */
    private String productCode;

    /** 关联物料编码。 */
    private String materialCode;

    /** 状态：draft/in_review/approved/released/obsolete。 */
    private String status;
}
