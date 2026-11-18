package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商黑名单分页查询条件（对应 G4-N1，WBS T031）。
 * keyword 匹配 blacklistNo/supplierCode/supplierName/applyBy。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierBlacklistQuery extends PageQuery {

    /** 黑名单类型。 */
    private String blacklistType;

    /** 黑名单状态。 */
    private String blacklistStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
