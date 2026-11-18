package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 数据集保存请求（G1-N2 报表平台 WBS T010）。
 */
@Data
public class SysReportDatasetSaveRequest {

    /** 数据集编码（为空时自动生成）。 */
    private String datasetCode;

    /** 数据集名称。 */
    @NotBlank(message = "数据集名称不能为空")
    private String datasetName;

    /** 所属业务域。 */
    private String bizDomain;

    /** 来源类型：TABLE/VIEW/API/SQL。 */
    private String sourceType;

    /** 来源引用（表名/视图名/接口地址/自定义 SQL）。 */
    private String sourceRef;

    /** 过滤条件。 */
    private String filterCondition;

    /** 字段结构（JSON 文本）。 */
    private String fieldSchema;

    /** 刷新模式：MANUAL/SCHEDULED/REALTIME。 */
    private String refreshMode;

    /** 刷新周期表达式（Cron）。 */
    private String refreshCron;

    /** 最近刷新时间（yyyy-MM-dd HH:mm:ss）。 */
    private String lastRefreshAt;

    /** 数据行数。 */
    private Long rowCount;

    /** 责任人。 */
    private String ownerName;

    /** 数据集状态：DRAFT/ACTIVE/DISABLED。 */
    private String datasetStatus;

    /** 数据集说明。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
