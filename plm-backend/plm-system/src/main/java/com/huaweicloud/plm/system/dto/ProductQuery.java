package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 产品型号分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ProductQuery extends PageQuery {

    /** 产品系列编码。 */
    private String seriesCode;

    /** 客户编码。 */
    private String customerCode;

    /** 状态：draft/released/obsolete。 */
    private String status;
}
