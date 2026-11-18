package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商年度复审分页查询条件（对应供应商年度复审）。
 * keyword 匹配 reviewNo/supplierCode/supplierName/reviewer。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierReviewQuery extends PageQuery {

    /** 复审类型。 */
    private String reviewType;

    /** 复审状态。 */
    private String reviewStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
