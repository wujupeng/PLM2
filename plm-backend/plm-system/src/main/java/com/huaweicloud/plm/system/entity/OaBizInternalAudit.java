package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 内部审核实施计划（OA-DEV-074）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_internal_audit")
public class OaBizInternalAudit extends BaseEntity {

    /** 审核单号。 */
    private String auditNo;

    private String auditPlanName;

    private String auditScope;

    private String auditStandard;

    private LocalDate planStart;

    private LocalDate planEnd;

    /** 审核员用户 ID 列表（逗号分隔）。 */
    private String auditorUserIds;

    private String auditorNames;

    private Long auditedDeptId;

    private String auditedDeptName;

    /** 审核状态：PLANNED/IN_PROGRESS/CLOSED 等。 */
    private String auditStatus;

    private Integer issueCount;

    private String auditConclusion;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
