package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * BOM 分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BomQuery extends PageQuery {

    /** 产品编码。 */
    private String productCode;

    /** BOM 类型：EBOM/MBOM。 */
    private String bomType;

    /** 状态：draft/released/obsolete。 */
    private String status;
}
