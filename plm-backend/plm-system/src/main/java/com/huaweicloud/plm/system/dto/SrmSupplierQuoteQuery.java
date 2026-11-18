package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商报价分页查询条件（对应供应商报价）。
 * keyword 匹配 quoteNo/rfqNo/supplierCode/supplierName/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierQuoteQuery extends PageQuery {

    /** 报价状态。 */
    private String quoteStatus;

    /** 询价单号。 */
    private String rfqNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 物料编码。 */
    private String materialCode;
}
