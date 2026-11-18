package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseEntity {

    private String username;

    /** BCrypt 散列后的密码。 */
    private String password;

    private String displayName;

    private String email;

    private String phone;

    private Long orgId;

    /** 1=启用，0=停用。 */
    private Integer status;

    private LocalDateTime lastLoginAt;

    private String remark;
}
