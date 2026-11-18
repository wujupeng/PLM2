package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批节点（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 定义流程内审批顺序、审批人（角色/用户/组织）与审批方式（ANY 或签 / ALL 会签），
 * allowTransfer 控制是否允许转办。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_approval_node")
public class SysApprovalNode extends BaseEntity {

    /** 节点编号（唯一，支持人工指定）。 */
    private String nodeNo;

    /** 所属流程编码。 */
    private String flowCode;

    /** 节点顺序，默认 1。 */
    private Integer nodeOrder;

    /** 节点名称。 */
    private String nodeName;

    /** 审批人类型：ROLE/USER/ORG，默认 ROLE。 */
    private String approverType;

    /** 审批人取值（角色码/用户ID/组织ID，视审批人类型而定）。 */
    private String approverValue;

    /** 审批方式：ANY 或签/ALL 会签，默认 ANY。 */
    private String approveMode;

    /** 是否允许转办：0 否/1 是，默认 0。 */
    private Integer allowTransfer;

    /** 节点状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String nodeStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
