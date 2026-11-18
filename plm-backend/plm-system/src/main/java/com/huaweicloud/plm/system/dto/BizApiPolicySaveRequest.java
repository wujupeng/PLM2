package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * API 网关策略保存入参（OA-DEV-086）。
 */
@Data
public class BizApiPolicySaveRequest {

    private String policyNo;

    private String policyName;

    private String pathPrefix;

    private String upstream;

    private String httpMethods;

    /** 认证方式：JWT/OAUTH2/APPKEY/SIGN。 */
    private String authType;

    private Integer rateLimitQps;

    private Boolean signatureFlag;

    private String apiVersion;

    private String ipAllowList;

    private String ipDenyList;

    private Boolean auditFlag;

    private Integer status;

    private String remark;
}
