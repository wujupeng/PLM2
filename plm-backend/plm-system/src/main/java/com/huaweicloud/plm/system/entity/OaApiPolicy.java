package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * API 网关策略（OA-DEV-086）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_api_policy")
public class OaApiPolicy extends BaseEntity {

    /** 策略编号。 */
    private String policyNo;

    /** 策略名称。 */
    private String policyName;

    /** 路径前缀。 */
    private String pathPrefix;

    /** 上游服务。 */
    private String upstream;

    /** 允许的 HTTP 方法，逗号分隔。 */
    private String httpMethods;

    /** 认证方式：JWT/OAUTH2/APPKEY/SIGN。 */
    private String authType;

    /** 限流阈值（QPS）。 */
    private Integer rateLimitQps;

    /** 是否启用签名校验：0/1。 */
    private Integer signatureFlag;

    /** 接口版本。 */
    private String apiVersion;

    /** IP 白名单，逗号分隔。 */
    private String ipAllowList;

    /** IP 黑名单，逗号分隔。 */
    private String ipDenyList;

    /** 是否记录访问审计：0/1。 */
    private Integer auditFlag;

    /** 状态：0 停用 / 1 启用。 */
    private Integer status;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
