package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 历史流程档案保存请求（OA-DEV-102）。
 */
@Data
public class BizMigrationHistoryFlowSaveRequest {

    /** 档案编号。 */
    private String archiveNo;

    /** 源流程单号。 */
    @NotBlank(message = "源流程单号不能为空")
    private String sourceInstanceNo;

    /** 流程编码。 */
    private String processCode;

    /** 流程名称。 */
    private String processName;

    /** 流程标题。 */
    private String title;

    /** 表单快照。 */
    private String formSnapshot;

    /** 发起人姓名。 */
    private String applicantName;

    /** 发起人组织快照。 */
    private String applicantOrg;

    /** 发起时间（yyyy-MM-dd HH:mm:ss）。 */
    private String startTime;

    /** 结束时间（yyyy-MM-dd HH:mm:ss）。 */
    private String endTime;

    /** 实例状态：RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String instanceStatus;

    /** 审批意见。 */
    private String approvalJson;

    /** 处理时间线。 */
    private String timelineJson;

    /** 附件数量。 */
    private Integer attachmentCount;

    /** 是否已迁移。 */
    private Boolean migratedFlag;

    /** 原查询人姓名快照。 */
    private String queryUserName;

    /** 备注。 */
    private String remark;
}
