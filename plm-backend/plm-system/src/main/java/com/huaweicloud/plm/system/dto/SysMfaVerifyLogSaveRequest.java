package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * MFA 校验日志保存请求（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）。
 */
@Data
public class SysMfaVerifyLogSaveRequest {

    /** 日志编号（为空时自动生成）。 */
    private String logNo;

    /** 用户ID。 */
    private Long userId;

    /** 用户名。 */
    private String username;

    /** 认证方式：TOTP/SMS/EMAIL。 */
    private String mfaType;

    /** 校验场景：LOGIN/SENSITIVE_OP/UNBIND。 */
    private String verifyScene;

    /** 校验结果：SUCCESS/FAIL/EXPIRED。 */
    private String verifyResult;

    /** 失败原因。 */
    private String failReason;

    /** 客户端IP。 */
    private String clientIp;

    /** 校验时间。 */
    private LocalDateTime verifyTime;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
