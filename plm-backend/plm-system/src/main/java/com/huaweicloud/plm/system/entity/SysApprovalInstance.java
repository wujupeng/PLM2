package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 审批实例（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 记录单据提交审批的运行态（当前节点、状态），终态为 APPROVED/REJECTED/CANCELED。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_approval_instance")
public class SysApprovalInstance extends BaseEntity {

    /** 实例编号（唯一，支持人工指定）。 */
    private String instanceNo;

    /** 所属流程编码。 */
    private String flowCode;

    /** 单据类型。 */
    private String docType;

    /** 单据编号。 */
    private String docNo;

    /** 业务标题。 */
    private String bizTitle;

    /** 提交人ID。 */
    private Long submitterId;

    /** 提交人姓名。 */
    private String submitterName;

    /** 提交时间。 */
    private LocalDateTime submitTime;

    /** 当前节点编号。 */
    private String currentNode;

    /** 实例状态：PENDING/APPROVED/REJECTED/CANCELED，默认 PENDING。 */
    private String instanceStatus;

    /** 完成时间。 */
    private LocalDateTime finishedTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
