package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 主数据变更申请保存请求（G1-N8 主数据平台 T007 变更申请）。
 */
@Data
public class SysMdmChangeRequestSaveRequest {

    /** 变更申请编号（为空时自动生成）。 */
    private String changeNo;

    /** 主数据域编码。 */
    @NotBlank(message = "主数据域编码不能为空")
    private String domainCode;

    /** 主数据编码。 */
    private String masterCode;

    /** 变更类型，为空默认 UPDATE。 */
    private String changeType;

    /** 变更前值。 */
    private String beforeValue;

    /** 变更后值。 */
    private String afterValue;

    /** 变更原因。 */
    private String changeReason;

    /** 申请状态，为空默认 SUBMITTED。 */
    private String requestStatus;

    /** 申请人名称，为空时取当前登录用户。 */
    private String applicantName;

    /** 审批人名称。 */
    private String approverName;

    /** 申请时间，为空时取当前时间。 */
    private LocalDateTime applyTime;

    /** 审批时间。 */
    private LocalDateTime approveTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
