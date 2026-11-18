package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 电子看板分页查询条件（N7，DEV-076）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsKanbanQuery extends PageQuery {

    /** 看板类型：PRODUCTION/SUPPLIER/IN_HOUSE。 */
    private String kanbanType;

    /** 物料编码。 */
    private String materialCode;

    /** 产线。 */
    private String lineCode;

    /** 看板状态：FULL/EMPTY/REPLENISHING/IDLE。 */
    private String kanbanStatus;

    /** 状态：enabled/disabled。 */
    private String status;
}
