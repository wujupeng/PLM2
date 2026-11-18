package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 供应商年度复审保存请求（对应供应商年度复审）。
 */
@Data
public class SrmSupplierReviewSaveRequest {

    /** 复审单号（为空时自动生成）。 */
    private String reviewNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 复审周期。 */
    private String reviewPeriod;

    /** 复审类型，为空默认 ANNUAL。 */
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

    /** 复审状态，为空默认 PENDING。 */
    private String reviewStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
