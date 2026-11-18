package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 盘点差异单分页查询条件。
 * keyword 匹配 diffNo/stocktakeNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsStocktakeDiffQuery extends PageQuery {

    /** 差异状态。 */
    private String diffStatus;

    /** 差异类型。 */
    private String diffType;

    /** 盘点单号。 */
    private String stocktakeNo;

    /** 物料编码。 */
    private String materialCode;
}
