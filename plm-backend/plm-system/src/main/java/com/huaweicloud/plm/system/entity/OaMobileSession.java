package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 移动设备会话（OA-DEV-085）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_mobile_session")
public class OaMobileSession extends BaseEntity {

    /** 会话编号。 */
    private String sessionNo;

    /** 用户ID。 */
    private Long userId;

    /** 用户姓名。 */
    private String userName;

    /** 设备ID。 */
    private String deviceId;

    /** 设备型号。 */
    private String deviceModel;

    /** 操作系统版本。 */
    private String osVersion;

    /** 应用版本。 */
    private String appVersion;

    /** 客户端类型：APP/WEB/H5 等。 */
    private String clientType;

    /** 登录IP。 */
    private String loginIp;

    /** 推送令牌。 */
    private String pushToken;

    /** 登录时间。 */
    private LocalDateTime loginTime;

    /** 最后活跃时间。 */
    private LocalDateTime lastActiveTime;

    /** 过期时间。 */
    private LocalDateTime expireTime;

    /** 会话状态：ACTIVE/EXPIRED/REVOKED 等。 */
    private String sessionStatus;

    /** 注销原因。 */
    private String revokeReason;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
