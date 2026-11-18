package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 单点登录提供商（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）：
 * 按协议（SAML/OIDC/CAS）登记服务提供方参数，支持接入企业统一身份提供方。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_sso_provider")
public class SysSsoProvider extends BaseEntity {

    /** 提供商编码（唯一，支持人工指定）。 */
    private String providerCode;

    /** 提供商名称。 */
    private String providerName;

    /** 协议：SAML/OIDC/CAS。 */
    private String protocol;

    /** 协议版本。 */
    private String protocolVer;

    /** 颁发者（Issuer）。 */
    private String issuer;

    /** 单点登录地址。 */
    private String ssoUrl;

    /** 单点登出地址。 */
    private String logoutUrl;

    /** 元数据地址。 */
    private String metadataUrl;

    /** 客户端ID。 */
    private String clientId;

    /** 证书算法。 */
    private String certificateAlgo;

    /** 提供商状态：DRAFT/ACTIVE/DISABLED。 */
    private String providerStatus;

    /** 最近同步时间。 */
    private LocalDateTime lastSyncAt;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
