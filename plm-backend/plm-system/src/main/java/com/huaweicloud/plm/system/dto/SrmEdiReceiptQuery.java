package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * EDI 回执分页查询条件（对应 EDI 回执）。
 * keyword 匹配 receiptNo/ediNo/partnerCode/partnerName/receiptCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmEdiReceiptQuery extends PageQuery {

    /** 回执类型：ACK/NAK/APPLICATION。 */
    private String receiptType;

    /** 回执状态：RECEIVED/PROCESSED/FAILED。 */
    private String receiptStatus;

    /** 合作方编码。 */
    private String partnerCode;

    /** EDI 报文编号。 */
    private String ediNo;
}
