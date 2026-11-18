package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 单据状态流转规则（G1-N6 公共平台底座—通用能力，WBS T102 单据状态机）：
 * 按「单据类型 + 起始状态 + 动作」登记目标状态，正/反向流转用 transitionType 区分，
 * 可要求审批（requireApproval）或填写原因（requireReason），permissionCode 控制允许执行的角色。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_doc_transition")
public class SysDocTransition extends BaseEntity {

    /** 单据类型。 */
    private String docType;

    /** 起始状态编码。 */
    private String fromState;

    /** 目标状态编码。 */
    private String toState;

    /** 动作编码。 */
    private String actionCode;

    /** 动作名称。 */
    private String actionName;

    /** 流转类型：FORWARD 正向/REVERSE 反向，默认 FORWARD。 */
    private String transitionType;

    /** 是否要求审批：0 否/1 是，默认 0。 */
    private Integer requireApproval;

    /** 是否要求填写原因：0 否/1 是，默认 0。 */
    private Integer requireReason;

    /** 执行该流转所需权限码。 */
    private String permissionCode;

    /** 流转状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String transitionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
