package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购建议分页查询条件（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 * keyword 匹配 suggestionNo/materialName/suggestedSupplier。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseSuggestionQuery extends PageQuery {

    /** 建议状态。 */
    private String suggestionStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 关联运算单号。 */
    private String runNo;
}
