package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存冻结单分页查询条件（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * keyword 匹配 freezeNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpInventoryFreezeQuery extends PageQuery {

    /** 冻结类型。 */
    private String freezeType;

    /** 冻结状态。 */
    private String freezeStatus;

    /** 仓库编码。 */
    private String warehouseCode;
}
