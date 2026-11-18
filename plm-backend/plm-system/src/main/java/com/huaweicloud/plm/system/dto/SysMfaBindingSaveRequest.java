package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 多因素认证绑定保存请求（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）。
 */
@Data
public class SysMfaBindingSaveRequest {

    /** 绑定编号（为空时自动生成）。 */
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

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
