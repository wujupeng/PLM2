package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 跨组织授权保存请求（G1-N5 公共平台底座—多组织多工厂 WBS T100）。
 */
@Data
public class SysOrgGrantSaveRequest {

    /** 授权编号（为空时自动生成）。 */
    private String grantNo;

    /** 授权类型：LEGAL/FACTORY/WAREHOUSE/LINE/ORG。 */
    private String grantType;

    /** 授权方编码。 */
    private String grantorCode;

    /** 被授权组织ID。 */
    private Long granteeOrgId;

    /** 被授权方名称。 */
    private String granteeName;

    /** 作用范围类型：ALL/FACTORY/WAREHOUSE/LINE。 */
    private String scopeType;

    /** 作用范围值。 */
    private String scopeValue;

    /** 生效时间。 */
    private LocalDateTime effectiveDate;

    /** 失效时间。 */
    private LocalDateTime expireDate;

    /** 授权状态：ACTIVE/EXPIRED/REVOKED。 */
    private String grantStatus;

    /** 授权原因。 */
    private String grantReason;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
