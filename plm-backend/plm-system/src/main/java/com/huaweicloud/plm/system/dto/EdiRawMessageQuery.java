package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * EDI 原始报文分页查询条件（N6，DEV-064/068）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiRawMessageQuery extends PageQuery {

    /** 伙伴编码。 */
    private String partnerCode;

    /** 交易代码。 */
    private String transCode;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 解析状态：RECEIVED/PARSED/FAILED/DUPLICATE/DEAD_LETTER。 */
    private String parseStatus;

    /** 是否重复：1 是 / 0 否。 */
    private Integer duplicateFlag;

    /** 接收时间起（含）。 */
    private LocalDate dateFrom;

    /** 接收时间止（含）。 */
    private LocalDate dateTo;
}
