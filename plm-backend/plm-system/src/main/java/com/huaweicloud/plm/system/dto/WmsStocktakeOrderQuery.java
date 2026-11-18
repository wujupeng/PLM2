package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 盘点单分页查询条件。
 * keyword 匹配 stocktakeNo/warehouseCode/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsStocktakeOrderQuery extends PageQuery {

    /** 盘点状态。 */
    private String stocktakeStatus;

    /** 盘点类型。 */
    private String stocktakeType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 物料编码。 */
    private String materialCode;
}
