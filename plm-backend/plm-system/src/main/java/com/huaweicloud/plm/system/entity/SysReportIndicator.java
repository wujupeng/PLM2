package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 指标口径（G1-N2 报表平台 WBS T010）：指标统一登记，口径、计算公式、单位与数据来源集中维护，
 * 避免各报表各算一套导致数据打架。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_report_indicator")
public class SysReportIndicator extends BaseEntity {

    /** 指标编码（唯一，支持人工指定）。 */
    private String indicatorCode;

    /** 指标名称。 */
    private String indicatorName;

    /** 所属业务域。 */
    private String bizDomain;

    /** 指标分类。 */
    private String category;

    /** 统计口径说明。 */
    private String caliber;

    /** 计算公式。 */
    private String formula;

    /** 计量单位。 */
    private String unit;

    /** 小数位数。 */
    private Integer decimalScale;

    /** 数据来源。 */
    private String dataSource;

    /** 刷新周期：REALTIME/HOURLY/DAILY/WEEKLY/MONTHLY。 */
    private String refreshCycle;

    /** 责任人。 */
    private String ownerName;

    /** 指标状态：DRAFT/ACTIVE/DISABLED。 */
    private String indicatorStatus;

    /** 指标说明。 */
    private String description;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
