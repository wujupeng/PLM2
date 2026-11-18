package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 报价比价分页查询条件（对应报价比价）。
 * keyword 匹配 compareNo/rfqNo/recommendSupplierCode/recommendSupplierName/compareBy。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmPriceCompareQuery extends PageQuery {

    /** 比价状态。 */
    private String compareStatus;

    /** 询价单号。 */
    private String rfqNo;
}
