package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存报废单分页查询条件（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * keyword 匹配 scrapNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpInventoryScrapQuery extends PageQuery {

    /** 报废类型。 */
    private String scrapType;

    /** 报废状态。 */
    private String scrapStatus;

    /** 仓库编码。 */
    private String warehouseCode;
}
