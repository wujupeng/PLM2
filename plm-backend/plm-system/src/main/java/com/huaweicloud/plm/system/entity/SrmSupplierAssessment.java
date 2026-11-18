package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 供应商质量—供应商考评：登记考评单号、供应商、考评周期与类型、
 * 质量/交期/价格/服务四维得分与综合得分、等级评定、考评结论与考评状态，支撑供应商月度/季度/年度考评。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier_assessment")
public class SrmSupplierAssessment extends BaseEntity {

    /** 考评单号（为空时自动生成）。 */
    private String assessmentNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 考评周期。 */
    private String assessmentPeriod;

    /** 考评类型，默认 MONTHLY。 */
    private String assessmentType;

    /** 质量得分。 */
    private BigDecimal qualityScore;

    /** 交期得分。 */
    private BigDecimal deliveryScore;

    /** 价格得分。 */
    private BigDecimal priceScore;

    /** 服务得分。 */
    private BigDecimal serviceScore;

    /** 综合得分。 */
    private BigDecimal totalScore;

    /** 等级评定。 */
    private String gradeLevel;

    /** 考评结论。 */
    private String assessmentResult;

    /** 考评人。 */
    private String assessor;

    /** 考评日期。 */
    private LocalDate assessDate;

    /** 考评状态，默认 DRAFT。 */
    private String assessmentStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
