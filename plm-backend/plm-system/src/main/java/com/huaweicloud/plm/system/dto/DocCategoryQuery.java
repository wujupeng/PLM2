package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 图文档分类分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocCategoryQuery extends PageQuery {

    /** 分类编码。 */
    private String categoryCode;

    /** 图文档类型。 */
    private String docType;

    /** 状态：0-停用 1-启用。 */
    private Integer status;
}
