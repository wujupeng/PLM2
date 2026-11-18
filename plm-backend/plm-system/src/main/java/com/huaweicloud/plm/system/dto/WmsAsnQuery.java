package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 收货通知单分页查询条件（对应收货通知单）。
 * keyword 匹配 asnNo/supplierCode/supplierName/poNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsAsnQuery extends PageQuery {

    /** ASN 类型。 */
    private String asnType;

    /** ASN 状态。 */
    private String asnStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 采购/委外单号。 */
    private String poNo;
}
