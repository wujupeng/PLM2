package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_audit_log")
public class SysAuditLog extends BaseEntity {

    private String traceId;

    private Long userId;

    private String username;

    /** 业务模块，取请求路径首段，例如 system、auth。 */
    private String module;

    private String httpMethod;

    private String uri;

    private String ip;

    private String requestParams;

    private Integer resultCode;

    /** 1=成功，0=失败。 */
    private Integer success;

    private Long costMs;

    private String errorMessage;
}
