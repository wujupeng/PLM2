package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 工程变更单（ECO）（DEV-040）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("eco_change_order")
public class EcoChangeOrder extends BaseEntity {

    /** 变更单编号，规则 ECO-{yyyyMM}-{4 位流水号}。 */
    private String ecoNo;

    /** 来源变更申请 ID。 */
    private Long ecrId;

    /** 来源变更申请编号。 */
    private String ecrNo;

    /** 变更单标题。 */
    private String title;

    /** 变更类型：add/modify/delete/switch。 */
    private String changeType;

    /** 变更方案说明。 */
    private String planDesc;

    /** 审批状态：draft/submitted/approved/rejected。 */
    private String approvalStatus;

    /** 审批人 ID。 */
    private Long approverId;

    /** 审批人姓名。 */
    private String approverName;

    /** 审批意见。 */
    private String approvalComment;

    /** 审批时间。 */
    private LocalDateTime approvedAt;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 生效批次。 */
    private String effectiveBatch;

    /** 执行状态：pending/executing/completed。 */
    private String executionStatus;

    /** 执行完成时间。 */
    private LocalDateTime executedAt;

    private String remark;
}
