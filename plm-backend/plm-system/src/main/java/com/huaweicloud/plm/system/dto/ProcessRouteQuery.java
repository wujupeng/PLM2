package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工艺路线分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ProcessRouteQuery extends PageQuery {

    /** 路线编码。 */
    private String routeCode;

    /** 产品编码。 */
    private String productCode;

    /** 状态：draft/released/obsolete。 */
    private String status;
}
