package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 整改跟踪分页查询条件（对应整改跟踪）。
 * keyword 匹配 rectificationNo/sourceNo/supplierCode/supplierName/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmRectificationQuery extends PageQuery {

    /** 整改状态。 */
    private String rectificationStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 来源单号。 */
    private String sourceNo;
}
