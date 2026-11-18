package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 数据集市（G1-N2 报表平台 WBS T010）：数据集登记来源（表/视图/接口）、过滤条件与字段结构，
 * 报表只引用数据集，隔离底层模型变更对报表的影响。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_report_dataset")
public class SysReportDataset extends BaseEntity {

    /** 数据集编码（唯一，支持人工指定）。 */
    private String datasetCode;

    /** 数据集名称。 */
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

    /** 最近刷新时间。 */
    private LocalDateTime lastRefreshAt;

    /** 数据行数。 */
    private Long rowCount;

    /** 责任人。 */
    private String ownerName;

    /** 数据集状态：DRAFT/ACTIVE/DISABLED。 */
    private String datasetStatus;

    /** 数据集说明。 */
    private String description;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
