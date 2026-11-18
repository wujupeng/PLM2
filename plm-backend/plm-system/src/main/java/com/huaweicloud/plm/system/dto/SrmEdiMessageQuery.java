package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * EDI 报文分页查询条件（对应 EDI 报文）。
 * keyword 匹配 ediNo/partnerCode/partnerName/bizNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmEdiMessageQuery extends PageQuery {

    /** 方向：OUTBOUND/INBOUND。 */
    private String direction;

    /** 报文类型：DEMAND/FORECAST/ORDER/CHANGE/ASN/INVOICE。 */
    private String messageType;

    /** 报文状态。 */
    private String messageStatus;

    /** 合作方编码。 */
    private String partnerCode;
}
