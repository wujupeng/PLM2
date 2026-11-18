package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 供应商门户—供应商账号：登记门户账号编号、供应商与登录信息、联系人及联系方式、
 * 门户角色、协同范围、生效与失效日期及账号状态，支撑供应商门户账号的准入与协同权限管理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_portal_account")
public class SrmPortalAccount extends BaseEntity {

    /** 门户账号编号（为空时自动生成）。 */
    private String accountNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 登录名。 */
    private String loginName;

    /** 联系人。 */
    private String contactName;

    /** 联系电话。 */
    private String contactPhone;

    /** 联系邮箱。 */
    private String contactEmail;

    /** 门户角色，默认 VIEWER。 */
    private String portalRole;

    /** 协同范围，逗号分隔：ORDER,DELIVERY,QUALITY,ASN。 */
    private String collabScope;

    /** 生效日期。 */
    private LocalDate validFrom;

    /** 失效日期。 */
    private LocalDate validTo;

    /** 账号状态，默认 DRAFT。 */
    private String accountStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
