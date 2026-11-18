package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * EDI 交易日志分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiTransactionLogQuery extends PageQuery {

    /** 报文编号。 */
    private String messageNo;

    /** 伙伴编码。 */
    private String partnerCode;

    /** 交易代码。 */
    private String transCode;

    /** 动作类型：RECEIVE/PARSE/SEND/ACK/RETRY/REPLAY。 */
    private String actionType;

    /** 结果：SUCCESS/FAIL。 */
    private String result;

    /** 日志时间起（含，按日）。 */
    private LocalDate dateFrom;

    /** 日志时间止（含，按日）。 */
    private LocalDate dateTo;
}
