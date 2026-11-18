package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ASN 发货通知分页查询条件（对应 ASN 发货通知）。
 * keyword 匹配 asnNo/appointmentNo/poNo/supplierCode/supplierName/trackingNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmAsnQuery extends PageQuery {

    /** 发货状态。 */
    private String asnStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 采购订单号。 */
    private String poNo;
}
