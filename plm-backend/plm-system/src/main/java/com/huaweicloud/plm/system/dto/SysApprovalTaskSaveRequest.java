package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审批任务保存请求（G1-N6 WBS T103 可配置审批）。
 */
@Data
public class SysApprovalTaskSaveRequest {

    /** 任务编号（为空时自动生成）。 */
    private String taskNo;

    /** 所属实例编号。 */
    @NotBlank(message = "实例编号不能为空")
    private String instanceNo;

    /** 所属节点编号。 */
    @NotBlank(message = "节点编号不能为空")
    private String nodeNo;

    /** 审批人ID。 */
    private Long approverId;

    /** 审批人姓名。 */
    private String approverName;

    /** 任务状态：PENDING/APPROVED/REJECTED/TRANSFERRED，为空默认 PENDING。 */
    private String taskStatus;

    /** 处理意见。 */
    private String handleComment;

    /** 处理时间。 */
    private LocalDateTime handledTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
