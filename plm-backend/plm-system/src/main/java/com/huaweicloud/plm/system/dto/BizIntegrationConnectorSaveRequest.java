package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 集成连接器保存入参（OA-DEV-089 ~ OA-DEV-093）。
 */
@Data
public class BizIntegrationConnectorSaveRequest {

    private String connectorNo;

    private String connectorName;

    /** 系统编码：PLM/ERP/MES/QMS/EDI。 */
    private String systemCode;

    private String systemType;

    private String baseUrl;

    /** 认证方式：JWT/OAUTH2/APPKEY/SIGN。 */
    private String authType;

    private String authoritySystem;

    /** 同步方向：INBOUND/OUTBOUND/BIDIRECTIONAL。 */
    private String syncDirection;

    private Boolean ssoFlag;

    private Boolean todoSyncFlag;

    private String masterDataScope;

    private Long credentialId;

    /** 凭证到期日（yyyy-MM-dd）。 */
    private String credentialExpireDate;

    private Integer status;

    private String remark;
}
