package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 供应商全生命周期—供应商主档（对应 G4-N1，WBS T031）：
 * 供应商权威主数据，供 ERP/OA 引用。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier")
public class SrmSupplier extends BaseEntity {

    /** 供应商编码（唯一，必填）。 */
    private String supplierCode;

    /** 供应商名称（必填）。 */
    private String supplierName;

    /** 供应商简称。 */
    private String shortName;

    /** 供应商类型，默认 RAW。 */
    private String supplierType;

    /** 统一社会信用代码。 */
    private String unifiedSocialCode;

    /** 法定代表人。 */
    private String legalPerson;

    /** 注册资本。 */
    private BigDecimal registeredCapital;

    /** 经营范围。 */
    private String businessScope;

    /** 所在地区。 */
    private String region;

    /** 所属行业。 */
    private String industry;

    /** 联系人。 */
    private String contact;

    /** 联系电话。 */
    private String phone;

    /** 联系邮箱。 */
    private String email;

    /** 联系地址。 */
    private String address;

    /** 等级。 */
    private String gradeLevel;

    /** 供应商状态，默认 PENDING。 */
    private String supplierStatus;

    /** 黑名单标记，默认 0。 */
    private Integer blacklistFlag;

    /** 准入日期。 */
    private LocalDate admissionDate;

    /** 来源。 */
    private String source;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
