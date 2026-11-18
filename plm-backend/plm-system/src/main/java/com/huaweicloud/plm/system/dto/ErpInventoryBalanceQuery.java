package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存余额分页查询条件（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * keyword 匹配 materialCode/materialName/warehouseName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpInventoryBalanceQuery extends PageQuery {

    /** 仓库编码。 */
    private String warehouseCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;
}
