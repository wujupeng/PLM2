package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 生产补料单分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsReplenishOrderQuery extends PageQuery {

    /** 补料状态。 */
    private String replenishStatus;

    /** 补料类型。 */
    private String replenishType;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
