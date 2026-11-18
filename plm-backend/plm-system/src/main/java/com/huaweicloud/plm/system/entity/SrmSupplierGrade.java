package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 供应商管理—供应商分级：
 * 登记分级单号、供应商编码/名称、分级等级与周期、评分与依据、评价人、评级日期与状态，
 * 支撑供应商分级追溯与管理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier_grade")
public class SrmSupplierGrade extends BaseEntity {

    /** 分级单号（唯一，为空时自动生成）。 */
    private String gradeNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 分级等级，默认 C。 */
    private String gradeLevel;

    /** 分级周期。 */
    private String gradePeriod;

    /** 分级评分。 */
    private BigDecimal gradeScore;

    /** 分级依据。 */
    private String gradeBasis;

    /** 评价人。 */
    private String evaluator;

    /** 评级日期。 */
    private LocalDate gradeDate;

    /** 分级状态，默认 DRAFT。 */
    private String gradeStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
