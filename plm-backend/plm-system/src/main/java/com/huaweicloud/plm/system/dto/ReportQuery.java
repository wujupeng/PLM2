package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * G1-N2 报表平台通用分页查询条件。
 * 各字段按业务对象选择性使用：bizDomain/category（指标口径）、sourceType/refreshMode（数据集）、
 * chartType（报表定义）、indicatorStatus/datasetStatus/reportStatus/dashboardStatus/exportStatus（各对象状态）、
 * startDate/endDate（时间区间，作用于创建时间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ReportQuery extends PageQuery {

    /** 所属业务域。 */
    private String bizDomain;

    /** 分类（指标分类/报表分类）。 */
    private String category;

    /** 来源类型：TABLE/VIEW/API/SQL（数据集）。 */
    private String sourceType;

    /** 刷新模式：MANUAL/SCHEDULED/REALTIME（数据集）。 */
    private String refreshMode;

    /** 图表类型（报表定义）。 */
    private String chartType;

    /** 指标状态（指标口径）。 */
    private String indicatorStatus;

    /** 数据集状态（数据集）。 */
    private String datasetStatus;

    /** 报表状态（报表定义）。 */
    private String reportStatus;

    /** 看板状态（经营驾驶舱）。 */
    private String dashboardStatus;

    /** 导出结果状态（导出审计）。 */
    private String exportStatus;

    /** 起始日期（yyyy-MM-dd）。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd）。 */
    private String endDate;
}
