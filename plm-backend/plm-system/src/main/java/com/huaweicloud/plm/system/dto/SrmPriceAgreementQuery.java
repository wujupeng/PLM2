package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 定点定价协议分页查询条件（对应定点定价协议）。
 * keyword 匹配 agreementNo/supplierCode/supplierName/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmPriceAgreementQuery extends PageQuery {

    /** 价格类型。 */
    private String priceType;

    /** 协议状态。 */
    private String agreementStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 物料编码。 */
    private String materialCode;
}
