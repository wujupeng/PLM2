package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 线边仓库存分页查询条件。
 * keyword 匹配 materialCode/materialName/batchNo/binCode/lineCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsLineSideInventoryQuery extends PageQuery {

    /** 库存状态。 */
    private String stockStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 产线编码。 */
    private String lineCode;

    /** 仓库编码。 */
    private String warehouseCode;
}
