package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 流程节点保存请求（G1-N7 治理中心 T003 流程建模）。
 */
@Data
public class SysGovProcessNodeSaveRequest {

    /** 节点编号（为空时自动生成）。 */
    private String nodeNo;

    /** 所属流程编码（必填）。 */
    @NotBlank(message = "所属流程编码不能为空")
    private String processCode;

    /** 节点编码。 */
    private String nodeCode;

    /** 节点名称。 */
    @NotBlank(message = "节点名称不能为空")
    private String nodeName;

    /** 节点类型，为空默认 ACTIVITY。 */
    private String nodeType;

    /** 节点顺序号，为空默认 1。 */
    private Integer seqNo;

    /** 角色名称。 */
    private String roleName;

    /** 系统域。 */
    private String systemDomain;

    /** 输入物。 */
    private String inputArtifact;

    /** 输出物。 */
    private String outputArtifact;

    /** 节点状态，为空默认 ACTIVE。 */
    private String nodeStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
