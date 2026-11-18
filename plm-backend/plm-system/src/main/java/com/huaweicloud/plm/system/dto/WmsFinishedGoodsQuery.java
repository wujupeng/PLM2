package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 成品入库单分页查询条件。
 * keyword 匹配 fgNo/workOrderNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsFinishedGoodsQuery extends PageQuery {

    /** 入库状态。 */
    private String fgStatus;

    /** 入库类型。 */
    private String fgType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
