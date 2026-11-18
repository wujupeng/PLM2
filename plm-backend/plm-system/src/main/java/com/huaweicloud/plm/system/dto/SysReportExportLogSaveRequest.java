package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 导出审计保存请求（G1-N2 报表平台 WBS T010）。
 */
@Data
public class SysReportExportLogSaveRequest {

    /** 导出编号（为空时自动生成）。 */
    private String exportNo;

    /** 报表编码。 */
    @NotBlank(message = "报表编码不能为空")
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

    /** 导出时间（yyyy-MM-dd HH:mm:ss）。 */
    private String exportTime;

    /** 导出结果：SUCCESS/FAILED。 */
    private String resultStatus;

    /** 来源 IP。 */
    private String ipAddress;

    /** 筛选条件摘要。 */
    private String filterSummary;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
