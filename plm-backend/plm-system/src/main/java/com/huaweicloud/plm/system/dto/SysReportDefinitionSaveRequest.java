package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 报表定义保存请求（G1-N2 报表平台 WBS T010）。
 */
@Data
public class SysReportDefinitionSaveRequest {

    /** 报表编码（为空时自动生成）。 */
    private String reportCode;

    /** 报表名称。 */
    @NotBlank(message = "报表名称不能为空")
    private String reportName;

    /** 所属业务域。 */
    private String bizDomain;

    /** 报表分类。 */
    private String category;

    /** 引用的数据集编码。 */
    private String datasetCode;

    /** 图表类型：TABLE/BAR/LINE/PIE/GAUGE/CARD。 */
    private String chartType;

    /** 引用的指标编码（多个以逗号分隔）。 */
    private String indicatorCodes;

    /** 查看权限码。 */
    private String permissionCode;

    /** 数据权限过滤条件（行级过滤）。 */
    private String rowFilter;

    /** 是否允许导出：1 是，0 否。 */
    private Integer exportEnabled;

    /** 导出是否审计：1 是，0 否。 */
    private Integer exportAuditFlag;

    /** 报表状态：DRAFT/PUBLISHED/DISABLED。 */
    private String reportStatus;

    /** 责任人。 */
    private String ownerName;

    /** 报表说明。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
