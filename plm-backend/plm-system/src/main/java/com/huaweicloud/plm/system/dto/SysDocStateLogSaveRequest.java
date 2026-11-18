package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 单据状态流转日志保存请求（G1-N6 WBS T102 单据状态机）。
 */
@Data
public class SysDocStateLogSaveRequest {

    /** 日志编号（为空时自动生成）。 */
    private String logNo;

    /** 单据类型。 */
    @NotBlank(message = "单据类型不能为空")
    private String docType;

    /** 单据号。 */
    @NotBlank(message = "单据号不能为空")
    private String docNo;

    /** 单据标题。 */
    private String bizTitle;

    /** 变更前状态编码。 */
    private String fromState;

    /** 变更后状态编码。 */
    @NotBlank(message = "目标状态不能为空")
    private String toState;

    /** 动作编码。 */
    private String actionCode;

    /** 动作名称。 */
    private String actionName;

    /** 变更原因。 */
    private String reason;

    /** 操作人ID（为空时取当前登录用户）。 */
    private Long operatorId;

    /** 操作人姓名（为空时取当前登录用户）。 */
    private String operatorName;

    /** 操作时间（为空时取当前时间）。 */
    private java.time.LocalDateTime operateTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
