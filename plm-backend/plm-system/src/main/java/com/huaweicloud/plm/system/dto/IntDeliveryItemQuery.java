package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 交付物分页查询条件（N9，DEV-105）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntDeliveryItemQuery extends PageQuery {

    /** 交付物编号。 */
    private String itemNo;

    /** 交付类别。 */
    private String category;

    /** 状态。 */
    private String status;

    /** 名称。 */
    private String name;
}
