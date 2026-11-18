package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 审批节点保存请求（G1-N6 WBS T103 可配置审批）。
 */
@Data
public class SysApprovalNodeSaveRequest {

    /** 节点编号（为空时自动生成）。 */
    private String nodeNo;

    /** 所属流程编码。 */
    @NotBlank(message = "流程编码不能为空")
    private String flowCode;

    /** 节点顺序，为空默认 1。 */
    private Integer nodeOrder;

    /** 节点名称。 */
    @NotBlank(message = "节点名称不能为空")
    private String nodeName;

    /** 审批人类型：ROLE/USER/ORG，为空默认 ROLE。 */
    private String approverType;

    /** 审批人取值。 */
    private String approverValue;

    /** 审批方式：ANY/ALL，为空默认 ANY。 */
    private String approveMode;

    /** 是否允许转办：0 否/1 是，为空默认 0。 */
    private Integer allowTransfer;

    /** 节点状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String nodeStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
