package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 每日流水号分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CodeSequenceQuery extends PageQuery {

    /** 流水号键。 */
    private String seqKey;

    /** 维度：DAY / MONTH / 其它。 */
    private String seqDimension;

    /** 归属日期起始。 */
    private LocalDate seqDateFrom;

    /** 归属日期截止。 */
    private LocalDate seqDateTo;

    /** 预警标记。 */
    private Integer warnFlag;
}
