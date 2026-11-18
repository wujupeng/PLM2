package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * EDI 交易集分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiTransactionSetQuery extends PageQuery {

    /** 伙伴编码，* 表示通用。 */
    private String partnerCode;

    /** 交易代码，如 850/856/997。 */
    private String transCode;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 标准：X12/EDIFACT。 */
    private String standard;

    /** 状态：enabled/disabled。 */
    private String status;
}
