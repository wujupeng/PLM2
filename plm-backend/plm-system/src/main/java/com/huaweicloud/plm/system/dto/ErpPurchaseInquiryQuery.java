package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购询价单分页查询条件（对应 WBS T023 采购管理，属 G3 ERP）。
 * keyword 匹配 inquiryNo/materialCode/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseInquiryQuery extends PageQuery {

    /** 询价单状态。 */
    private String inquiryStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 供应商编码。 */
    private String supplierCode;
}
