package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 经营驾驶舱（G1-N2 报表平台 WBS T010）：看板装载组件布局，引用指标与报表，按角色/受众发布，
 * 支撑经营驾驶舱。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_report_dashboard")
public class SysReportDashboard extends BaseEntity {

    /** 看板编码（唯一，支持人工指定）。 */
    private String dashboardCode;

    /** 看板名称。 */
    private String dashboardName;

    /** 所属业务域。 */
    private String bizDomain;

    /** 受众。 */
    private String audience;

    /** 布局方式：GRID/FREE。 */
    private String layoutMode;

    /** 组件布局结构（JSON 文本）。 */
    private String widgetSchema;

    /** 刷新间隔（秒）。 */
    private Integer refreshIntervalSec;

    /** 责任人。 */
    private String ownerName;

    /** 看板状态：DRAFT/PUBLISHED/DISABLED。 */
    private String dashboardStatus;

    /** 看板说明。 */
    private String description;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
