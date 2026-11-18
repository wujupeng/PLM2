package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 收付款单分页查询条件（对应 WBS T028 ERP 财务，属 G3 ERP）。
 * keyword 匹配 paymentNo/partyName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinancePaymentQuery extends PageQuery {

    /** 收付款类型。 */
    private String paymentType;

    /** 收付款状态。 */
    private String paymentStatus;

    /** 往来单位编码。 */
    private String partyCode;
}
