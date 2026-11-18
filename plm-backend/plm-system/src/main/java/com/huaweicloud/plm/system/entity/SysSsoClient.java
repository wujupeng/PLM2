package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_sso_client")
public class SysSsoClient extends BaseEntity {

    private String clientId;

    private String clientSecret;

    private String clientName;

    private String redirectUri;

    private String grantTypes;

    private String scopes;

    private Integer tokenTtlSeconds;

    /** enabled / disabled。 */
    private String status;

    private String remark;
}
