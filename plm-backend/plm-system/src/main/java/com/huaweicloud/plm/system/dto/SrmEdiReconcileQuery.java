package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * EDI 对账分页查询条件（对应 EDI 对账）。
 * keyword 匹配 reconcileNo/partnerCode/partnerName/reconcilePeriod。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmEdiReconcileQuery extends PageQuery {

    /** 报文类型。 */
    private String messageType;

    /** 对账状态。 */
    private String reconcileStatus;

    /** 合作方编码。 */
    private String partnerCode;

    /** 对账周期。 */
    private String reconcilePeriod;
}
