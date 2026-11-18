package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 多因素认证绑定（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）：
 * MFA 绑定与用户一对多（不同认证方式），绑定密钥加密存储，支撑登录与敏感操作二次认证。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mfa_binding")
public class SysMfaBinding extends BaseEntity {

    /** 绑定编号（唯一，支持人工指定）。 */
    private String bindNo;

    /** 用户ID。 */
    private Long userId;

    /** 用户名。 */
    private String username;

    /** 认证方式：TOTP/SMS/EMAIL。 */
    private String mfaType;

    /** 绑定密钥（加密存储）。 */
    private String secretKey;

    /** 密钥版本。 */
    private String keyVer;

    /** 联系手机号。 */
    private String contactPhone;

    /** 联系邮箱。 */
    private String contactEmail;

    /** 绑定状态：PENDING/BOUND/UNBOUND/DISABLED。 */
    private String bindStatus;

    /** 绑定时间。 */
    private LocalDateTime bindTime;

    /** 最近校验时间。 */
    private LocalDateTime lastVerifyAt;

    /** 校验成功次数。 */
    private Integer verifyCount;

    /** 校验失败次数。 */
    private Integer failCount;

    /** 过期时间。 */
    private LocalDateTime expireTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
