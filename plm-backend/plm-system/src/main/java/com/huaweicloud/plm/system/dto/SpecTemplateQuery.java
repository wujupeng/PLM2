package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 技术规格模板分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SpecTemplateQuery extends PageQuery {

    /** 模板编码。 */
    private String templateCode;

    /** 规格分类。 */
    private String specCategory;

    /** 产品系列。 */
    private String productSeries;

    /** 状态：draft/released/obsolete。 */
    private String status;
}
