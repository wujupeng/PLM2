package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存成本核算单分页查询条件（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * keyword 匹配 costNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpInventoryCostQuery extends PageQuery {

    /** 成本核算方法。 */
    private String costMethod;

    /** 核算状态。 */
    private String costStatus;

    /** 期间。 */
    private String period;

    /** 物料编码。 */
    private String materialCode;
}
