package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 导出审计（G1-N2 报表平台 WBS T010）：记录导出人、导出范围、行数、文件大小与结果，
 * 满足数据外发审计要求。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_report_export_log")
public class SysReportExportLog extends BaseEntity {

    /** 导出编号（唯一，为空时自动生成）。 */
    private String exportNo;

    /** 报表编码。 */
    private String reportCode;

    /** 报表名称。 */
    private String reportName;

    /** 导出格式：EXCEL/CSV/PDF。 */
    private String exportType;

    /** 导出行数。 */
    private Integer exportRows;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 导出人。 */
    private String exportBy;

    /** 导出时间。 */
    private LocalDateTime exportTime;

    /** 导出结果：SUCCESS/FAILED。 */
    private String resultStatus;

    /** 来源 IP。 */
    private String ipAddress;

    /** 筛选条件摘要。 */
    private String filterSummary;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
