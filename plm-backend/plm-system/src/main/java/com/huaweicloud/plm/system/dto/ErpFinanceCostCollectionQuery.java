package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 成本归集分页查询条件（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 * keyword 匹配 collectionNo/objectCode/objectName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinanceCostCollectionQuery extends PageQuery {

    /** 归集对象类型。 */
    private String objectType;

    /** 成本要素。 */
    private String costElement;

    /** 归集状态。 */
    private String collectionStatus;

    /** 会计期间编码。 */
    private String periodCode;
}
