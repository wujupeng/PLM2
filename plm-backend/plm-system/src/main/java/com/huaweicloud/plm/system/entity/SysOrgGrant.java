package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 跨组织授权（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 当用户需要访问非本组织维度数据时，通过授权关系显式放开，
 * 按授权类型（法人/工厂/仓库/产线/组织）与作用范围登记，支持有效期与撤销。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_org_grant")
public class SysOrgGrant extends BaseEntity {

    /** 授权编号（唯一，支持人工指定）。 */
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

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
