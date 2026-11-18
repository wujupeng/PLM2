package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存调拨分页查询条件（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * keyword 匹配 transferNo/fromWarehouseName/toWarehouseName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpInventoryTransferQuery extends PageQuery {

    /** 调拨状态。 */
    private String transferStatus;

    /** 调拨类型。 */
    private String transferType;

    /** 调出仓库编码。 */
    private String fromWarehouseCode;
}
