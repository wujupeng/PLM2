package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 扫描日志分页查询条件（N5）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ScanLogQuery extends PageQuery {

    /** 扫描流水号。 */
    private String scanNo;

    /** 原标签编码。 */
    private String sourceCode;

    /** 追溯码。 */
    private String targetCode;

    /** 动作类型。 */
    private String actionType;

    /** 是否有效：1/0。 */
    private Integer validFlag;

    /** 终端编号。 */
    private String terminalNo;

    /** 编码规则编码。 */
    private String ruleCode;

    /** 起始日期（含）。 */
    private LocalDate dateFrom;

    /** 结束日期（含）。 */
    private LocalDate dateTo;
}
