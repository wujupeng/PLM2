package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 经营驾驶舱保存请求（G1-N2 报表平台 WBS T010）。
 */
@Data
public class SysReportDashboardSaveRequest {

    /** 看板编码（为空时自动生成）。 */
    private String dashboardCode;

    /** 看板名称。 */
    @NotBlank(message = "看板名称不能为空")
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

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
