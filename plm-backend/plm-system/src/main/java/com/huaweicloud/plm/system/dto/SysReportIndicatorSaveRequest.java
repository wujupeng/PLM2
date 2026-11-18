package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 指标口径保存请求（G1-N2 报表平台 WBS T010）。
 */
@Data
public class SysReportIndicatorSaveRequest {

    /** 指标编码（为空时自动生成）。 */
    private String indicatorCode;

    /** 指标名称。 */
    @NotBlank(message = "指标名称不能为空")
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

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
