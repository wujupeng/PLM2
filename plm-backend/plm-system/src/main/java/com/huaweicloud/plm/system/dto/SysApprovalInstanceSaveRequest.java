package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审批实例保存请求（G1-N6 WBS T103 可配置审批）。
 */
@Data
public class SysApprovalInstanceSaveRequest {

    /** 实例编号（为空时自动生成）。 */
    private String instanceNo;

    /** 所属流程编码。 */
    @NotBlank(message = "流程编码不能为空")
    private String flowCode;

    /** 单据类型。 */
    @NotBlank(message = "单据类型不能为空")
    private String docType;

    /** 单据编号。 */
    @NotBlank(message = "单据编号不能为空")
    private String docNo;

    /** 业务标题。 */
    private String bizTitle;

    /** 提交人ID（为空取当前登录用户）。 */
    private Long submitterId;

    /** 提交人姓名（为空取当前登录用户）。 */
    private String submitterName;

    /** 提交时间（为空取当前时间）。 */
    private LocalDateTime submitTime;

    /** 当前节点编号。 */
    private String currentNode;

    /** 实例状态：PENDING/APPROVED/REJECTED/CANCELED，为空默认 PENDING。 */
    private String instanceStatus;

    /** 完成时间。 */
    private LocalDateTime finishedTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
