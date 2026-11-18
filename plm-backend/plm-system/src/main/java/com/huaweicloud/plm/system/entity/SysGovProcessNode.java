package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 流程节点（G1-N7 治理中心 T003 流程建模）：
 * 登记端到端流程下的节点类型、顺序、角色、系统域与输入输出物，支撑流程模型细化。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_process_node")
public class SysGovProcessNode extends BaseEntity {

    /** 节点编号（唯一，支持人工指定）。 */
    private String nodeNo;

    /** 所属流程编码（必填）。 */
    private String processCode;

    /** 节点编码。 */
    private String nodeCode;

    /** 节点名称。 */
    private String nodeName;

    /** 节点类型：ACTIVITY/GATEWAY/START/END/...，默认 ACTIVITY。 */
    private String nodeType;

    /** 节点顺序号，默认 1。 */
    private Integer seqNo;

    /** 角色名称。 */
    private String roleName;

    /** 系统域。 */
    private String systemDomain;

    /** 输入物。 */
    private String inputArtifact;

    /** 输出物。 */
    private String outputArtifact;

    /** 节点状态：ACTIVE/...，默认 ACTIVE。 */
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
