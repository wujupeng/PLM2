package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 单点登录提供商保存请求（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）。
 */
@Data
public class SysSsoProviderSaveRequest {

    /** 提供商编码（为空时自动生成）。 */
    private String providerCode;

    /** 提供商名称。 */
    @NotBlank(message = "提供商名称不能为空")
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

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
