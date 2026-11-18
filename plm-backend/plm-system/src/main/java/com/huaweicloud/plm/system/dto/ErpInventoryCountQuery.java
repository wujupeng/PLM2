package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存盘点多分页查询条件（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * keyword 匹配 countNo/warehouseName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpInventoryCountQuery extends PageQuery {

    /** 盘点状态。 */
    private String countStatus;

    /** 盘点类型。 */
    private String countType;

    /** 盘点仓库编码。 */
    private String warehouseCode;
}
