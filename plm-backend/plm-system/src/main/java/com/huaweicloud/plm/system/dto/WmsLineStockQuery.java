package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 线边库存分页查询条件（N7，DEV-081）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsLineStockQuery extends PageQuery {

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 库存状态：NORMAL/WARNING/SHORTAGE。 */
    private String stockStatus;
}
