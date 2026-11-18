package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 供应商管理—供应商年度复审（对应供应商年度复审）：
 * 登记复审单号、供应商、复审周期与类型、评级与评分、复审结论，支撑供应商年度复审追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier_review")
public class SrmSupplierReview extends BaseEntity {

    /** 复审单号（唯一，为空时自动生成）。 */
    private String reviewNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 复审周期。 */
    private String reviewPeriod;

    /** 复审类型，默认 ANNUAL。 */
    private String reviewType;

    /** 当前等级。 */
    private String currentGrade;

    /** 复审评分。 */
    private BigDecimal reviewScore;

    /** 复审结论。 */
    private String reviewResult;

    /** 复审人。 */
    private String reviewer;

    /** 复审日期。 */
    private LocalDate reviewDate;

    /** 下次复审日期。 */
    private LocalDate nextReviewDate;

    /** 复审状态，默认 PENDING。 */
    private String reviewStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
