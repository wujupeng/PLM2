package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 询价邀请供应商分页查询条件（对应询价邀请供应商）。
 * keyword 匹配 inviteNo/rfqNo/supplierCode/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmRfqSupplierQuery extends PageQuery {

    /** 邀请状态。 */
    private String inviteStatus;

    /** 询价单号。 */
    private String rfqNo;

    /** 供应商编码。 */
    private String supplierCode;
}
