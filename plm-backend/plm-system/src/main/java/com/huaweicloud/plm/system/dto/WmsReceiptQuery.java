package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 收货单分页查询条件（对应收货单）。
 * keyword 匹配 receiptNo/asnNo/supplierCode/supplierName/operator。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsReceiptQuery extends PageQuery {

    /** 收货方式。 */
    private String receiveType;

    /** 收货状态。 */
    private String receiveStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 收货通知单号。 */
    private String asnNo;
}
