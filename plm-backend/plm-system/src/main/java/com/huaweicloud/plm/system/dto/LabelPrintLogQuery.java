package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 标签打印日志分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class LabelPrintLogQuery extends PageQuery {

    /** 任务编号。 */
    private String taskNo;

    /** 目标编码。 */
    private String targetCode;

    /** 操作类型：PRINT/REPRINT/VOID。 */
    private String actionType;

    /** 结果。 */
    private String result;

    /** 起始日期。 */
    private LocalDate dateFrom;

    /** 截止日期。 */
    private LocalDate dateTo;
}
