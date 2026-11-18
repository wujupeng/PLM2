package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * MFA 校验日志（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份 / 敏感操作追踪）：
 * 每次多因素认证校验登记留痕，供安全审计与异常登录追踪。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mfa_verify_log")
public class SysMfaVerifyLog extends BaseEntity {

    /** 日志编号（唯一，支持人工指定）。 */
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

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
