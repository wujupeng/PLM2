package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 报表定义（G1-N2 报表平台 WBS T010）：报表声明查看权限码与数据权限过滤条件（行级过滤），
 * 导出需审计，避免全员可见与数据越权导出。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_report_definition")
public class SysReportDefinition extends BaseEntity {

    /** 报表编码（唯一，支持人工指定）。 */
    private String reportCode;

    /** 报表名称。 */
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

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
