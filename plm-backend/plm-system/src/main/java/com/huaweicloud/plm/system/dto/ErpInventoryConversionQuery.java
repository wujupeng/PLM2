package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 形态转换单分页查询条件（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * keyword 匹配 conversionNo/sourceMaterialCode/targetMaterialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpInventoryConversionQuery extends PageQuery {

    /** 转换类型。 */
    private String conversionType;

    /** 转换状态。 */
    private String conversionStatus;

    /** 仓库编码。 */
    private String warehouseCode;
}
