package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 单据状态流转规则保存请求（G1-N6 WBS T102 单据状态机）。
 */
@Data
public class SysDocTransitionSaveRequest {

    /** 单据类型。 */
    @NotBlank(message = "单据类型不能为空")
    private String docType;

    /** 起始状态编码。 */
    @NotBlank(message = "起始状态不能为空")
    private String fromState;

    /** 目标状态编码。 */
    @NotBlank(message = "目标状态不能为空")
    private String toState;

    /** 动作编码。 */
    @NotBlank(message = "动作编码不能为空")
    private String actionCode;

    /** 动作名称。 */
    @NotBlank(message = "动作名称不能为空")
    private String actionName;

    /** 流转类型：FORWARD 正向/REVERSE 反向，为空默认 FORWARD。 */
    private String transitionType;

    /** 是否要求审批：0 否/1 是，为空默认 0。 */
    private Integer requireApproval;

    /** 是否要求填写原因：0 否/1 是，为空默认 0。 */
    private Integer requireReason;

    /** 执行该流转所需权限码。 */
    private String permissionCode;

    /** 流转状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String transitionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
