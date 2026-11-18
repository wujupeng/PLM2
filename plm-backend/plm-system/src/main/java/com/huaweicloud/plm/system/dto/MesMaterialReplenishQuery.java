package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 补料记录分页查询条件。
 * keyword 匹配 replenishNo/workOrderNo/materialCode/materialName/batchNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesMaterialReplenishQuery extends PageQuery {

    /** 补料状态。 */
    private String replenishStatus;

    /** 补料类型。 */
    private String replenishType;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
