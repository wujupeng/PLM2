package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存批次分页查询条件（对应库存批次）。
 * keyword 匹配 batchNo/materialCode/materialName/binCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsInventoryBatchQuery extends PageQuery {

    /** 批次状态。 */
    private String batchStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 库存批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;
}
