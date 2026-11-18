package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 供应商考评保存请求（对应供应商考评）。
 */
@Data
public class SrmSupplierAssessmentSaveRequest {

    /** 考评单号（为空时自动生成）。 */
    private String assessmentNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 考评周期。 */
    private String assessmentPeriod;

    /** 考评类型，为空默认 MONTHLY。 */
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

    /** 考评状态，为空默认 DRAFT。 */
    private String assessmentStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
