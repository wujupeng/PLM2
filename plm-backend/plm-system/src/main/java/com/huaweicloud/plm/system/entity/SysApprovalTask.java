package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 审批任务（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 记录每个节点上具体审批人的待办与处理结果（含处理意见与时间），处理意见列避免保留字命名为 handleComment。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_approval_task")
public class SysApprovalTask extends BaseEntity {

    /** 任务编号（唯一，支持人工指定）。 */
    private String taskNo;

    /** 所属实例编号。 */
    private String instanceNo;

    /** 所属节点编号。 */
    private String nodeNo;

    /** 审批人ID。 */
    private Long approverId;

    /** 审批人姓名。 */
    private String approverName;

    /** 任务状态：PENDING/APPROVED/REJECTED/TRANSFERRED，默认 PENDING。 */
    private String taskStatus;

    /** 处理意见。 */
    private String handleComment;

    /** 处理时间。 */
    private LocalDateTime handledTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
