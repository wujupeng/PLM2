package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 上线值守与问题响应保存请求（OA-DEV-117）。
 */
@Data
public class OaGoliveWatchSaveRequest {

    /** 值守编号。 */
    private String watchNo;

    /** 值守名称。 */
    @NotBlank(message = "值守名称不能为空")
    private String watchName;

    /** 值守班次：FULL/DAY/NIGHT。 */
    private String watchShift;

    /** 值守角色：TECH/BIZ/OPS。 */
    private String dutyRole;

    /** 值守人员。 */
    private String dutyPerson;

    /** 监控范围。 */
    private String monitorScope;

    /** 登录量。 */
    private Integer loginCount;

    /** 流程量。 */
    private Integer flowCount;

    /** 邮件量。 */
    private Integer mailCount;

    /** 文档量。 */
    private Integer docCount;

    /** 接口调用量。 */
    private Integer apiCount;

    /** 问题总数。 */
    private Integer issueCount;

    /** 严重问题数。 */
    private Integer criticalIssueCount;

    /** 已闭环问题数。 */
    private Integer closedIssueCount;

    /** 值守状态：PENDING/CLOSED。 */
    private String watchStatus;

    /** 值守小结。 */
    private String reportSummary;

    /** 值守时间（yyyy-MM-dd HH:mm:ss）。 */
    private String watchTime;

    /** 备注。 */
    private String remark;
}
