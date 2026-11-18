package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存冻结分页查询条件（对应库存冻结）。
 * keyword 匹配 freezeNo/materialCode/materialName/batchNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsStockFreezeQuery extends PageQuery {

    /** 冻结状态。 */
    private String freezeStatus;

    /** 冻结类型。 */
    private String freezeType;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;
}
