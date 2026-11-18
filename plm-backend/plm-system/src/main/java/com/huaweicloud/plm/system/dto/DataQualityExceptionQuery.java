package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 数据异常队列分页查询条件（G1-N6 WBS T105 数据质量控制）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DataQualityExceptionQuery extends PageQuery {

    /** 命中规则编码。 */
    private String ruleCode;

    /** 目标实体。 */
    private String targetEntity;

    /** 记录业务键。 */
    private String recordKey;

    /** 异常级别：ERROR/WARN。 */
    private String errorLevel;

    /** 处理状态：OPEN/HANDLING/RESOLVED/IGNORED。 */
    private String exceptionStatus;

    /** 处理人。 */
    private String handlerName;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
